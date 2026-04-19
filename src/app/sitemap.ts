import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cityturizm.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/iletisim`,                           lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/duyurular`,                          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/basvuru`,                            lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    // Kurumsal
    { url: `${BASE_URL}/kurumsal/biz-kimiz`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/kurumsal/baskanin-mesaji`,           lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kurumsal/sirket-profili`,            lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kurumsal/kalite-politikasi`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/kurumsal/cevre-su-politikalari`,     lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/kurumsal/insan-kaynaklari`,          lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/kurumsal/arac-filosu`,               lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/kurumsal/is-sagligi-guvenligi`,      lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/kurumsal/kvkk`,                      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/kurumsal/gizlilik-ve-guvenlik`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/kurumsal/kullanim-kosullari`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/kurumsal/cerez-politikasi`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    // Hizmetler
    { url: `${BASE_URL}/hizmetler/personel-tasimacilik`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/hizmetler/ogrenci-tasimacilik`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/hizmetler/ozel-transfer-hizmetleri`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/hizmetler/arac-kiralama`,            lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/hizmetler/turizm-acenteligi`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/hizmetler/akaryakit-istasyonu`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Dynamic: Duyurular (announcements)
  let announcementRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: announcements } = await supabase
      .from('announcements')
      .select('slug, updated_at, created_at')
      .eq('published', true)

    announcementRoutes = (announcements || []).map(a => ({
      url: `${BASE_URL}/duyurular/${a.slug}`,
      lastModified: new Date(a.updated_at || a.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch { /* no announcements table or error — skip */ }

  return [...staticRoutes, ...announcementRoutes]
}
