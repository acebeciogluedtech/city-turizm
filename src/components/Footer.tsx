'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

// ── English default fallbacks (used when CMS has no EN value) ─────────────────
const EN_DEFAULTS: Record<string, string> = {
  'brand.description':      'For over 40 years, we have been providing safe, comfortable and professional service in the transportation sector.',
  'brand.hours':            'Mon – Sat: 09:00 – 18:00',
  'col_titles.kurumsal_title':  'Corporate',
  'col_titles.hizmetler_title': 'Services',
  'col_titles.basvuru_title':   'Apply',
  'col_titles.yasal_title':     'Legal Information',
  'col_titles.diger_title':     'Other',
  'kurumsal_links.bizkimiz_label':  'About Us',
  'kurumsal_links.baskan_label':    "Chairman's Message",
  'kurumsal_links.sirket_label':    'Company Profile',
  'kurumsal_links.kalite_label':    'Quality Policy',
  'kurumsal_links.cevre_label':     'Environmental & Water Policies',
  'kurumsal_links.ik_label':        'Human Resources',
  'kurumsal_links.filo_label':      'Vehicle Fleet',
  'kurumsal_links.isg_label':       'Occupational Health & Safety',
  'hizmetler_links.personel_label': 'Personnel Transportation',
  'hizmetler_links.ogrenci_label':  'Student Transportation',
  'hizmetler_links.transfer_label': 'Private Transfer Services',
  'hizmetler_links.arac_label':     'Vehicle Rental',
  'hizmetler_links.turizm_label':   'Tourism Agency',
  'hizmetler_links.akaryakit_label':'Fuel Station',
  'basvuru_links.genel_label':      'General Application',
  'basvuru_links.rehber_label':     'Guide Application',
  'basvuru_links.surucu_label':     'Driver Application',
  'basvuru_links.arac_label':       'Vehicle Application',
  'yasal_links.kvkk_label':         'GDPR / KVKK',
  'yasal_links.gizlilik_label':     'Privacy & Security',
  'yasal_links.kullanim_label':     'Terms of Use',
  'yasal_links.cerez_label':        'Cookie Policy',
  'diger_links.medya_label':        'Media',
  'diger_links.duyurular_label':    'Announcements',
  'diger_links.iletisim_label':     'Contact',
  'bottom.copyright':               '© 2025 City Turizm. All rights reserved.',
  'bottom.tagline':                 'The most important thing we carry is your trust.',
}

export default function Footer() {
  const [cms, setCms] = useState<Record<string, { tr: string; en: string }>>({})
  const [settings, setSettings] = useState<Record<string, string>>({})
  const { lang } = useLanguage()

  useEffect(() => {
    // CMS content (nav links, labels)
    fetch('/api/admin/content?pageId=footer')
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.length) {
          const map: Record<string, { tr: string; en: string }> = {}
          for (const row of data) {
            map[`${row.section_id}.${row.field_id}`] = { tr: row.tr || '', en: row.en || '' }
          }
          setCms(map)
        }
      })
      .catch(() => {})

    // Site settings (logo, contact info, social, copyright)
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(({ settings: s }) => { if (s) setSettings(s) })
      .catch(() => {})
  }, [])

  // Returns CMS value for current lang → falls back to EN_DEFAULTS (if EN) → then hardcoded fbTr
  function cm(sec: string, fid: string, fbTr: string): string {
    const key = `${sec}.${fid}`
    const effectiveFb = lang === 'en' ? (EN_DEFAULTS[key] ?? fbTr) : fbTr
    const entry = cms[key]
    if (!entry) return effectiveFb
    const val = lang === 'en' ? (entry.en || entry.tr) : entry.tr
    return val || effectiveFb
  }

  // ── Nav link builders ────────────────────────────────────────────────────────
  const kurumsalLinks = [
    { label: cm('kurumsal_links','bizkimiz_label','Biz Kimiz'),             href: cm('kurumsal_links','bizkimiz_href','/kurumsal/biz-kimiz') },
    { label: cm('kurumsal_links','baskan_label','Başkanın Mesajı'),         href: cm('kurumsal_links','baskan_href','/kurumsal/baskanin-mesaji') },
    { label: cm('kurumsal_links','sirket_label','Şirket Profili'),          href: cm('kurumsal_links','sirket_href','/kurumsal/sirket-profili') },
    { label: cm('kurumsal_links','kalite_label','Kalite Politikası'),       href: cm('kurumsal_links','kalite_href','/kurumsal/kalite-politikasi') },
    { label: cm('kurumsal_links','cevre_label','Çevre & Su Politikaları'),  href: cm('kurumsal_links','cevre_href','/kurumsal/cevre-su-politikalari') },
    { label: cm('kurumsal_links','ik_label','İnsan Kaynakları'),            href: cm('kurumsal_links','ik_href','/kurumsal/insan-kaynaklari') },
    { label: cm('kurumsal_links','filo_label','Araç Filosu'),               href: cm('kurumsal_links','filo_href','/kurumsal/arac-filosu') },
    { label: cm('kurumsal_links','isg_label','İş Sağlığı ve Güvenliği'),   href: cm('kurumsal_links','isg_href','/kurumsal/is-sagligi-guvenligi') },
  ]
  const hizmetlerLinks = [
    { label: cm('hizmetler_links','personel_label','Personel Taşımacılığı'),  href: cm('hizmetler_links','personel_href','/hizmetler/personel-tasimacilik') },
    { label: cm('hizmetler_links','ogrenci_label','Öğrenci Taşımacılığı'),    href: cm('hizmetler_links','ogrenci_href','/hizmetler/ogrenci-tasimacilik') },
    { label: cm('hizmetler_links','transfer_label','Özel Transfer Hizmetleri'), href: cm('hizmetler_links','transfer_href','/hizmetler/ozel-transfer') },
    { label: cm('hizmetler_links','arac_label','Araç Kiralama'),              href: cm('hizmetler_links','arac_href','/hizmetler/arac-kiralama') },
    { label: cm('hizmetler_links','turizm_label','Turizm Acenteliği'),        href: cm('hizmetler_links','turizm_href','/hizmetler/turizm-acenteligi') },
    { label: cm('hizmetler_links','akaryakit_label','Akaryakıt İstasyonu'),   href: cm('hizmetler_links','akaryakit_href','/hizmetler/akaryakit-istasyonu') },
  ]
  const basvuruLinks = [
    { label: cm('basvuru_links','genel_label','Genel Başvuru'),   href: cm('basvuru_links','genel_href','/basvuru?kategori=genel') },
    { label: cm('basvuru_links','rehber_label','Rehber Başvuru'), href: cm('basvuru_links','rehber_href','/basvuru?kategori=rehber') },
    { label: cm('basvuru_links','surucu_label','Sürücü Başvuru'), href: cm('basvuru_links','surucu_href','/basvuru?kategori=surucu') },
    { label: cm('basvuru_links','arac_label','Araç Başvuru'),     href: cm('basvuru_links','arac_href','/basvuru?kategori=arac') },
  ]
  const yasalLinks = [
    { label: cm('yasal_links','kvkk_label','KVKK'),                     href: cm('yasal_links','kvkk_href','/kurumsal/kvkk') },
    { label: cm('yasal_links','gizlilik_label','Gizlilik & Güvenlik'),  href: cm('yasal_links','gizlilik_href','/kurumsal/gizlilik-guvenlik') },
    { label: cm('yasal_links','kullanim_label','Kullanım Koşulları'),   href: cm('yasal_links','kullanim_href','/kurumsal/kullanim-kosullari') },
    { label: cm('yasal_links','cerez_label','Çerez Politikası'),        href: cm('yasal_links','cerez_href','/kurumsal/cerez-politikasi') },
  ]
  const digerLinks = [
    { label: cm('diger_links','medya_label','Medya'),         href: cm('diger_links','medya_href','/medya') },
    { label: cm('diger_links','duyurular_label','Duyurular'), href: cm('diger_links','duyurular_href','/duyurular') },
    { label: cm('diger_links','iletisim_label','İletişim'),   href: cm('diger_links','iletisim_href','/iletisim') },
  ]

  function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div>
        <h4 className="text-gray-900 font-bold text-sm mb-5 pb-3 border-b border-gray-100">
          {title}
        </h4>
        {children}
      </div>
    )
  }

  function NavList({ items }: { items: { label: string; href: string }[] }) {
    return (
      <ul className="space-y-2.5">
        {items.map(item => (
          <li key={item.label}>
            <Link href={item.href}
              className="text-gray-400 hover:text-amber-400 text-sm transition-colors
                         flex items-center gap-2 group">
              <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-amber-500
                               transition-colors flex-shrink-0" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <footer className="bg-white text-gray-400 border-t border-gray-100">

      {/* ── Main ── */}
      <div className="container mx-auto px-4 md:px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-10">

          {/* Brand col */}
          <div>
            <Link href="/" className="inline-block mb-5" style={{ cursor: 'pointer' }}>
              {settings.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_url} alt="City Turizm" className="h-11 w-auto object-contain" style={{ cursor: 'pointer' }} />
              ) : (
                <Image src="/images.png" alt="City Turizm" width={130} height={52}
                  className="h-11 w-auto object-contain" style={{ cursor: 'pointer' }} />
              )}
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-xs">
              {cm('brand','description','40 yılı aşkın süredir ulaşım sektöründe güvenli, konforlu ve profesyonel hizmet anlayışıyla yanınızdayız.')}
            </p>

            {/* Contact mini — prefers site_settings, falls back to CMS/hardcoded */}
            <ul className="space-y-2.5 text-sm mb-6">
              <li>
                <a href={settings.phone_1 ? `tel:${settings.phone_1.replace(/\s/g, '')}` : cm('brand','phone_href','tel:4441289')}
                  className="flex items-center gap-2.5 hover:text-amber-400 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" strokeWidth={1.75} />
                  <span className="font-semibold text-gray-900">{settings.phone_1 || cm('brand','phone','444 1 289')}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.contact_email || cm('brand','email','info@cityturizm.com')}`}
                  className="flex items-center gap-2.5 hover:text-amber-400 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" strokeWidth={1.75} />
                  {settings.contact_email || cm('brand','email','info@cityturizm.com')}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>{settings.address || cm('brand','address','Kartaltepe Mahallesi, Koşuyolu Aksu Caddesi, No:48, Bakırköy - İstanbul')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" strokeWidth={1.75} />
                <span>{settings.hours_weekday || cm('brand','hours','Pzt – Cmt: 09:00 – 18:00')}</span>
              </li>
            </ul>
          </div>

          {/* Kurumsal */}
          <FooterCol title={cm('col_titles','kurumsal_title','Kurumsal')}>
            <NavList items={kurumsalLinks} />
          </FooterCol>

          {/* Hizmetler */}
          <FooterCol title={cm('col_titles','hizmetler_title','Hizmetler')}>
            <NavList items={hizmetlerLinks} />
          </FooterCol>

          {/* Başvuru */}
          <FooterCol title={cm('col_titles','basvuru_title','Başvuru')}>
            <NavList items={basvuruLinks} />
          </FooterCol>

          {/* Yasal Bilgilendirme */}
          <FooterCol title={cm('col_titles','yasal_title','Yasal Bilgilendirme')}>
            <NavList items={yasalLinks} />
          </FooterCol>

          {/* Diğer */}
          <FooterCol title={cm('col_titles','diger_title','Diğer')}>
            <NavList items={digerLinks} />
          </FooterCol>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 py-5
                        flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">{settings.copyright_text || cm('bottom','copyright','© 2025 City Turizm. Tüm hakları saklıdır.')}</span>
          <span className="text-gray-400">{cm('bottom','tagline','Taşıdığımız en önemli şey güveniniz.')}</span>
        </div>
      </div>

    </footer>
  )
}
