#!/usr/bin/env node

/**
 * Convert all images in /public to WebP and AVIF
 * Usage: node scripts/convert-images.mjs
 *
 * - Scans /public recursively for jpg/jpeg/png/gif/bmp/tiff files
 * - Converts each to .webp (quality 82) and .avif (quality 70)
 * - Skips files that already have a .webp counterpart
 * - Max dimension: 2000px (preserves aspect ratio)
 * - Outputs a summary table of original vs compressed sizes
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

const CONVERTIBLE = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
const MAX_DIM = 2000
const WEBP_QUALITY = 82
const AVIF_QUALITY = 70

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

function collectImages(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectImages(full))
    } else if (CONVERTIBLE.includes(path.extname(entry.name).toLowerCase())) {
      results.push(full)
    }
  }
  return results
}

async function convert(filePath) {
  const ext = path.extname(filePath)
  const base = filePath.slice(0, -ext.length)
  const webpPath = base + '.webp'
  const avifPath = base + '.avif'

  const originalSize = fs.statSync(filePath).size
  const results = { file: path.relative(PUBLIC_DIR, filePath), originalSize }

  // ── WebP ────────────────────────────────────────────────────────────────────
  if (fs.existsSync(webpPath)) {
    const existingSize = fs.statSync(webpPath).size
    results.webp = { size: existingSize, skipped: true }
  } else {
    try {
      let pipeline = sharp(filePath)
      const meta = await pipeline.metadata()
      if ((meta.width && meta.width > MAX_DIM) || (meta.height && meta.height > MAX_DIM)) {
        pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      }
      await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(webpPath)
      const webpSize = fs.statSync(webpPath).size
      results.webp = { size: webpSize, savings: Math.round((1 - webpSize / originalSize) * 100) }
    } catch (e) {
      results.webp = { error: e.message }
    }
  }

  // ── AVIF ────────────────────────────────────────────────────────────────────
  if (fs.existsSync(avifPath)) {
    const existingSize = fs.statSync(avifPath).size
    results.avif = { size: existingSize, skipped: true }
  } else {
    try {
      let pipeline = sharp(filePath)
      const meta = await pipeline.metadata()
      if ((meta.width && meta.width > MAX_DIM) || (meta.height && meta.height > MAX_DIM)) {
        pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      }
      await pipeline.avif({ quality: AVIF_QUALITY, effort: 4 }).toFile(avifPath)
      const avifSize = fs.statSync(avifPath).size
      results.avif = { size: avifSize, savings: Math.round((1 - avifSize / originalSize) * 100) }
    } catch (e) {
      results.avif = { error: e.message }
    }
  }

  return results
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║   City Turizm — Image Compression: WebP + AVIF        ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')

  const images = collectImages(PUBLIC_DIR)
  console.log(`Found ${images.length} image(s) in /public\n`)

  if (images.length === 0) {
    console.log('Nothing to convert.\n')
    return
  }

  let totalOriginal = 0
  let totalWebp = 0
  let totalAvif = 0

  for (const img of images) {
    const r = await convert(img)
    totalOriginal += r.originalSize

    const webpInfo = r.webp?.error
      ? `ERROR: ${r.webp.error}`
      : r.webp?.skipped
        ? `SKIP  (${humanSize(r.webp.size)})`
        : `OK    ${humanSize(r.webp.size)} (-${r.webp.savings}%)`

    const avifInfo = r.avif?.error
      ? `ERROR: ${r.avif.error}`
      : r.avif?.skipped
        ? `SKIP  (${humanSize(r.avif.size)})`
        : `OK    ${humanSize(r.avif.size)} (-${r.avif.savings}%)`

    if (r.webp?.size) totalWebp += r.webp.size
    if (r.avif?.size) totalAvif += r.avif.size

    console.log(`  ${r.file}`)
    console.log(`    Original : ${humanSize(r.originalSize)}`)
    console.log(`    WebP     : ${webpInfo}`)
    console.log(`    AVIF     : ${avifInfo}`)
    console.log()
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log(`Total original : ${humanSize(totalOriginal)}`)
  if (totalWebp)  console.log(`Total WebP     : ${humanSize(totalWebp)}  (${Math.round((1 - totalWebp / totalOriginal) * 100)}% smaller)`)
  if (totalAvif) console.log(`Total AVIF     : ${humanSize(totalAvif)}  (${Math.round((1 - totalAvif / totalOriginal) * 100)}% smaller)`)
  console.log('═══════════════════════════════════════════════════════\n')
}

main().catch(console.error)
