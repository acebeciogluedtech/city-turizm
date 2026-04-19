import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import sharp from 'sharp'

// POST /api/admin/convert-webp — Convert all images (storage + external URLs) to WebP
export async function POST() {
  const results: { converted: string[]; skipped: string[]; errors: string[] } = {
    converted: [],
    skipped: [],
    errors: [],
  }

  try {
    // ── PHASE 1: Convert images in Supabase Storage ──
    const folders = ['uploads', 'hero', 'about', 'services', 'fleet', 'general', 'pages']
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']

    for (const folder of folders) {
      const { data: files } = await supabaseAdmin.storage.from('media').list(folder, { limit: 500 })
      if (!files) continue

      for (const f of files) {
        if (!f.name || f.name.startsWith('.')) continue
        const filePath = `${folder}/${f.name}`
        const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase()

        if (ext === '.webp' || !imageExts.includes(ext)) {
          results.skipped.push(filePath)
          continue
        }

        try {
          const { data: fileData, error: dlError } = await supabaseAdmin.storage.from('media').download(filePath)
          if (dlError || !fileData) { results.errors.push(`${filePath}: download failed`); continue }

          const rawBuffer = Buffer.from(await fileData.arrayBuffer())
          let pipeline = sharp(rawBuffer)
          const metadata = await sharp(rawBuffer).metadata()
          if (metadata.width && metadata.height && (metadata.width > 2000 || metadata.height > 2000)) {
            pipeline = pipeline.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          }
          const webpBuffer = await pipeline.webp({ quality: 80, effort: 4 }).toBuffer()
          const webpPath = filePath.replace(/\.[^.]+$/, '.webp')

          await supabaseAdmin.storage.from('media').upload(webpPath, webpBuffer, { contentType: 'image/webp', upsert: true })

          // Update DB references
          const oldUrl = supabaseAdmin.storage.from('media').getPublicUrl(filePath).data.publicUrl
          const newUrl = supabaseAdmin.storage.from('media').getPublicUrl(webpPath).data.publicUrl
          await updateDbUrls(oldUrl, newUrl)

          // Delete old
          await supabaseAdmin.storage.from('media').remove([filePath])
          const savings = Math.round((1 - webpBuffer.length / rawBuffer.length) * 100)
          results.converted.push(`storage: ${filePath} → .webp (${savings}% smaller)`)
        } catch (err: any) {
          results.errors.push(`${filePath}: ${err.message}`)
        }
      }
    }

    // ── PHASE 2: Download external image URLs from DB, convert & re-upload ──
    const { data: allRows } = await supabaseAdmin
      .from('page_content')
      .select('id, page_id, section_id, field_id, tr, en')

    if (allRows) {
      for (const row of allRows) {
        // Process TR field
        if (row.tr && isExternalImageUrl(row.tr)) {
          try {
            const newUrl = await downloadConvertUpload(row.tr, `${row.section_id}/${row.field_id}`)
            if (newUrl) {
              await supabaseAdmin.from('page_content').update({ tr: newUrl }).eq('id', row.id)
              results.converted.push(`db: ${row.section_id}/${row.field_id} TR → webp`)
            }
          } catch (err: any) {
            results.errors.push(`${row.section_id}/${row.field_id} TR: ${err.message}`)
          }
        }
        // Process EN field
        if (row.en && isExternalImageUrl(row.en)) {
          try {
            const newUrl = await downloadConvertUpload(row.en, `${row.section_id}/${row.field_id}_en`)
            if (newUrl) {
              await supabaseAdmin.from('page_content').update({ en: newUrl }).eq('id', row.id)
              results.converted.push(`db: ${row.section_id}/${row.field_id} EN → webp`)
            }
          } catch (err: any) {
            results.errors.push(`${row.section_id}/${row.field_id} EN: ${err.message}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        converted: results.converted.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      details: results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function isExternalImageUrl(val: string): boolean {
  if (!val.startsWith('http')) return false
  // Skip already-converted supabase webp URLs
  if (val.includes('supabase.co') && val.endsWith('.webp')) return false
  // Check if it looks like an image URL
  return /\.(jpg|jpeg|png|gif|bmp|tiff)/i.test(val) ||
    val.includes('unsplash.com') ||
    val.includes('images.')
}

async function downloadConvertUpload(url: string, nameHint: string): Promise<string | null> {
  // Download external image
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) return null

  const rawBuffer = Buffer.from(await res.arrayBuffer())

  // Skip tiny files (likely not images)
  if (rawBuffer.length < 1000) return null

  let pipeline = sharp(rawBuffer)
  const metadata = await sharp(rawBuffer).metadata()
  if (metadata.width && metadata.height && (metadata.width > 2000 || metadata.height > 2000)) {
    pipeline = pipeline.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
  }
  const webpBuffer = await pipeline.webp({ quality: 80, effort: 4 }).toBuffer()

  const safeName = nameHint.replace(/[^a-zA-Z0-9-_/]/g, '_').slice(0, 60)
  const filePath = `converted/${Date.now()}-${safeName}.webp`

  const { error } = await supabaseAdmin.storage
    .from('media')
    .upload(filePath, webpBuffer, { contentType: 'image/webp', upsert: true })

  if (error) throw new Error(error.message)

  return supabaseAdmin.storage.from('media').getPublicUrl(filePath).data.publicUrl
}

async function updateDbUrls(oldUrl: string, newUrl: string) {
  const { data: rows } = await supabaseAdmin
    .from('page_content')
    .select('id, tr, en')
    .or(`tr.eq.${oldUrl},en.eq.${oldUrl}`)

  if (rows) {
    for (const row of rows) {
      const updates: { tr?: string; en?: string } = {}
      if (row.tr === oldUrl) updates.tr = newUrl
      if (row.en === oldUrl) updates.en = newUrl
      if (Object.keys(updates).length > 0) {
        await supabaseAdmin.from('page_content').update(updates).eq('id', row.id)
      }
    }
  }
}
