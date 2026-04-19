import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Image optimization ──────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,          // 1 year CDN cache for images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'doqpxhxaeuyibyxpheru.supabase.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },

  // ── Compression ──────────────────────────────────────────────────────────────
  compress: true,

  // ── Production source maps (disable for smaller bundles) ────────────────────
  productionBrowserSourceMaps: false,

  // ── Experimental features ────────────────────────────────────────────────────
  experimental: {
    // Optimize package imports — only import what's used from large packages
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // ── HTTP Headers ─────────────────────────────────────────────────────────────
  // Sets cache headers for static assets and adds security headers
  async headers() {
    return [
      // Static assets: 1 year immutable cache
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Public images: 1 year cache
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|svg|gif|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, must-revalidate' },
        ],
      },
      // Fonts: 1 year cache
      {
        source: '/(.*)\\.(woff|woff2|ttf|otf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Security headers on all pages
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',   value: 'on' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ]
  },

}

export default nextConfig
