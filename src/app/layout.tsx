import type { Metadata } from 'next'
import Script from 'next/script'
import { createClient } from '@supabase/supabase-js'
import './globals.css'

// ── Fetch SEO settings server-side ───────────────────────────────────────────
async function getSeoSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase.from('seo_settings').select('key, value')
    const settings: Record<string, string> = {}
    for (const row of data || []) settings[row.key] = row.value ?? ''
    return settings
  } catch {
    return {}
  }
}

// ── Fetch site settings (logo, favicon, brand) ────────────────────────────────
async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase.from('site_settings').select('key, value')
    const settings: Record<string, string> = {}
    for (const row of data || []) settings[row.key] = row.value ?? ''
    return settings
  } catch {
    return {}
  }
}

const FALLBACK = {
  siteTitle:       'City Turizm | Yurt İçi ve Yurt Dışı Tur Paketleri',
  siteDescription: '40 yılı aşkın deneyimimizle yurt içi ve yurt dışı ulaşım hizmetleri, personel taşımacılığı, özel transfer ve araç kiralama çözümleri sunuyoruz.',
  siteKeywords:    'city turizm, personel taşımacılığı, özel transfer, araç kiralama, turizm acentesi, istanbul',
  siteUrl:         'https://cityturizm.com',
  ogImage:         'https://cityturizm.com/og-image.jpg',
  twitterHandle:   '@cityturizm',
  locale:          'tr_TR',
}

export async function generateMetadata(): Promise<Metadata> {
  const [s, site] = await Promise.all([getSeoSettings(), getSiteSettings()])
  const title       = s.meta_title        || FALLBACK.siteTitle
  const description = s.meta_description  || FALLBACK.siteDescription
  const keywords    = s.meta_keywords     || FALLBACK.siteKeywords
  const siteUrl     = s.site_url          || FALLBACK.siteUrl
  const ogImage     = s.og_image          || FALLBACK.ogImage
  const twitterHandle = s.twitter_handle  || FALLBACK.twitterHandle
  const faviconUrl    = site.favicon_url  || undefined

  return {
    title: {
      default: title,
      template: `%s | ${s.site_name || site.site_name || 'City Turizm'}`,
    },
    description,
    keywords,
    authors: [{ name: s.site_name || site.site_name || 'City Turizm' }],
    creator: s.site_name || site.site_name || 'City Turizm',
    metadataBase: new URL(siteUrl),
    ...(faviconUrl && {
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
    }),
    alternates: {
      canonical: siteUrl,
      languages: {
        'tr-TR': siteUrl,
        'en-US': `${siteUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: s.og_locale || FALLBACK.locale,
      url: siteUrl,
      siteName: s.site_name || 'City Turizm',
      title: s.og_title || title,
      description: s.og_description || description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: s.og_image_alt || title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle,
      creator: twitterHandle,
      title: s.og_title || title,
      description: s.og_description || description,
      images: [ogImage],
    },
    robots: {
      index: s.robots_noindex !== 'true',
      follow: s.robots_nofollow !== 'true',
      googleBot: {
        index: s.robots_noindex !== 'true',
        follow: s.robots_nofollow !== 'true',
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: s.google_site_verification || undefined,
    },
    other: {
      ...(s.msvalidate && { 'msvalidate.01': s.msvalidate }),
      ...(s.yandex_verification && { 'yandex-verification': s.yandex_verification }),
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [s, site] = await Promise.all([getSeoSettings(), getSiteSettings()])
  const brandColor = site.brand_color || '#F59E0B'

  // Build JSON-LD structured data
  const siteUrl = s.site_url || FALLBACK.siteUrl
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.schema_org_name || 'City Turizm',
    url: siteUrl,
    logo: s.schema_org_logo || `${siteUrl}/logo.png`,
    description: s.meta_description || FALLBACK.siteDescription,
    telephone: s.schema_org_phone || '+90 212 543 80 97',
    email: s.schema_org_email || 'info@cityturizm.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.schema_org_street || '',
      addressLocality: s.schema_org_city || 'İstanbul',
      addressCountry: s.schema_org_country || 'TR',
    },
    sameAs: [
      s.social_instagram && `https://instagram.com/${s.social_instagram.replace('@', '')}`,
      s.social_facebook && `https://facebook.com/${s.social_facebook.replace('@', '')}`,
      s.social_twitter && `https://twitter.com/${s.social_twitter.replace('@', '')}`,
      s.social_linkedin && `https://linkedin.com/company/${s.social_linkedin}`,
      s.social_youtube && `https://youtube.com/${s.social_youtube}`,
    ].filter(Boolean),
  }

  const localBusinessJsonLd = s.schema_local_business === 'true' ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: s.schema_org_name || 'City Turizm',
    url: siteUrl,
    telephone: s.schema_org_phone || '+90 212 543 80 97',
    priceRange: s.schema_price_range || '₺₺',
    openingHours: s.schema_opening_hours || 'Mo-Sa 09:00-18:00',
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.schema_org_street || '',
      addressLocality: s.schema_org_city || 'İstanbul',
      addressCountry: 'TR',
    },
  } : null

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: s.schema_org_name || 'City Turizm',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  // Extract GTM / GA4 IDs
  const gtmId  = s.gtm_id?.trim()  || ''
  const ga4Id  = s.ga4_id?.trim()  || ''
  const fbPixel = s.fb_pixel_id?.trim() || ''
  const customHeadCode = s.custom_head_code || ''
  const customBodyCode = s.custom_body_code || ''

  return (
    <html lang={s.site_language || 'tr'} suppressHydrationWarning
      style={{ ['--brand' as string]: brandColor, ['--brand-light' as string]: `${brandColor}1a` }}>
      <head>
        {/* ── Resource hints ── */}
        <link rel="preconnect" href="https://doqpxhxaeuyibyxpheru.supabase.co" />
        <link rel="dns-prefetch" href="https://doqpxhxaeuyibyxpheru.supabase.co" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />

        {/* ── Favicon (explicit link tag — overrides Next.js default) */}
        {site.favicon_url && (
          <>
            <link rel="icon" href={site.favicon_url} />
            <link rel="shortcut icon" href={site.favicon_url} />
            <link rel="apple-touch-icon" href={site.favicon_url} />
          </>
        )}

        {/* ── Canonical ── */}
        {s.canonical_url && <link rel="canonical" href={s.canonical_url} />}

        {/* ── Extra meta tags ── */}
        {s.meta_author && <meta name="author" content={s.meta_author} />}
        {s.meta_theme_color && <meta name="theme-color" content={s.meta_theme_color} />}
        {s.fb_app_id && <meta property="fb:app_id" content={s.fb_app_id} />}

        {/* ── JSON-LD: Organization ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        {/* ── JSON-LD: WebSite ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        {/* ── JSON-LD: LocalBusiness (optional) ── */}
        {localBusinessJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
          />
        )}

        {/* ── Google Analytics 4 ── */}
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        {/* ── Facebook Pixel ── */}
        {fbPixel && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
              (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixel}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* ── Custom <head> code ── */}
        {customHeadCode && (
          <script
            id="custom-head"
            dangerouslySetInnerHTML={{ __html: customHeadCode }}
          />
        )}
      </head>

      <body>
        {/* ── Google Tag Manager <noscript> ── */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0" width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* ── GTM Script ── */}
        {gtmId && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}

        {children}

        {/* ── Custom <body> code ── */}
        {customBodyCode && (
          <div id="custom-body-scripts" dangerouslySetInnerHTML={{ __html: customBodyCode }} />
        )}
      </body>
    </html>
  )
}
