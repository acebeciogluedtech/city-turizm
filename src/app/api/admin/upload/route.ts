import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import sharp from 'sharp'

// Image types that can be converted
const CONVERTIBLE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp', 'image/avif']

// POST /api/admin/upload — Upload file, auto-convert to WebP (+ AVIF for large images)
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'
    const format = (formData.get('format') as string) || 'webp' // 'webp' | 'avif' | 'both'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const timestamp = Date.now()
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 50)

    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const originalSize = rawBuffer.length

    // ── Non-image/SVG: upload to 'documents' bucket (accepts all MIME types) ────
    // The 'media' bucket only allows image types — PDFs/DOCs go to 'documents'.
    if (!CONVERTIBLE_TYPES.includes(file.type) || file.type === 'image/svg+xml') {
      const ext = file.name.split('.').pop() || 'bin'
      const filename = `${folder}/${timestamp}-${safeName}.${ext}`

      // Ensure the documents bucket exists
      try {
        const { data: buckets } = await supabaseAdmin.storage.listBuckets()
        const hasDocs = buckets?.some((b: { name: string }) => b.name === 'documents')
        if (!hasDocs) {
          await supabaseAdmin.storage.createBucket('documents', {
            public: true,
            fileSizeLimit: 52428800, // 50 MB
          })
        }
      } catch { /* ignore — bucket may already exist */ }

      const { data, error } = await supabaseAdmin.storage
        .from('documents')
        .upload(filename, rawBuffer, { contentType: file.type || 'application/octet-stream', upsert: true })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const { data: urlData } = supabaseAdmin.storage.from('documents').getPublicUrl(data.path)
      return NextResponse.json({ success: true, url: urlData.publicUrl, path: data.path, format: ext, originalSize, compressedSize: originalSize, savings: 0 })
    }

    // ── Prepare sharp pipeline ────────────────────────────────────────────────
    const metadata = await sharp(rawBuffer).metadata()
    const maxDim = 2000
    let pipeline = sharp(rawBuffer)
    if ((metadata.width && metadata.width > maxDim) || (metadata.height && metadata.height > maxDim)) {
      pipeline = pipeline.resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
    }

    // ── Always produce WebP (primary format, best browser support) ─────────
    const webpBuffer = await pipeline.clone().webp({ quality: 82, effort: 4 }).toBuffer()
    const webpFilename = `${folder}/${timestamp}-${safeName}.webp`

    const { data: webpData, error: webpError } = await supabaseAdmin.storage
      .from('media')
      .upload(webpFilename, webpBuffer, { contentType: 'image/webp', upsert: true })

    if (webpError) return NextResponse.json({ error: webpError.message }, { status: 500 })
    const { data: webpUrl } = supabaseAdmin.storage.from('media').getPublicUrl(webpData.path)

    // ── Also produce AVIF (better compression for large images) ─────────────
    let avifUrl: string | null = null
    if (format === 'both' || format === 'avif') {
      try {
        const avifBuffer = await pipeline.clone().avif({ quality: 70, effort: 4 }).toBuffer()
        const avifFilename = `${folder}/${timestamp}-${safeName}.avif`
        const { data: avifData, error: avifErr } = await supabaseAdmin.storage
          .from('media')
          .upload(avifFilename, avifBuffer, { contentType: 'image/avif', upsert: true })
        if (!avifErr && avifData) {
          const { data: avUrl } = supabaseAdmin.storage.from('media').getPublicUrl(avifData.path)
          avifUrl = avUrl.publicUrl
        }
      } catch { /* AVIF encoding failed — not critical */ }
    }

    const savings = Math.round((1 - webpBuffer.length / originalSize) * 100)

    return NextResponse.json({
      success: true,
      url: webpUrl.publicUrl,        // primary URL (WebP)
      avifUrl,                       // AVIF URL if requested
      path: webpData.path,
      format: 'webp',
      originalSize,
      compressedSize: webpBuffer.length,
      savings: savings > 0 ? savings : 0,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DELETE /api/admin/upload — Delete file from storage
export async function DELETE(request: Request) {
  try {
    const { path } = await request.json()
    if (!path) return NextResponse.json({ error: 'No path provided' }, { status: 400 })
    const { error } = await supabaseAdmin.storage.from('media').remove([path])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
