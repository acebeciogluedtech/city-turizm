import dynamic from 'next/dynamic'
import HeroSlider from '@/components/HeroSlider'
import { getPageContent } from '@/lib/content'

// Below-fold components are code-split and lazy-loaded
const AboutSection      = dynamic(() => import('@/components/AboutSection'),      { ssr: true })
const ReferencesSection = dynamic(() => import('@/components/ReferencesSection'), { ssr: true })
const Testimonials      = dynamic(() => import('@/components/Testimonials'),      { ssr: true })
const FaqNewsletter     = dynamic(() => import('@/components/FaqNewsletter'),     { ssr: true })
const ContactSection    = dynamic(() => import('@/components/ContactSection'),    { ssr: true })

export const revalidate = 300

export default async function Home() {
  const contentTr = await getPageContent('ana-sayfa', 'tr')
  const contentEn = await getPageContent('ana-sayfa', 'en')

  return (
    <>
      <HeroSlider contentTr={contentTr} contentEn={contentEn} />
      <AboutSection contentTr={contentTr} contentEn={contentEn} />
      <ReferencesSection contentTr={contentTr} contentEn={contentEn} />
      <Testimonials contentTr={contentTr} contentEn={contentEn} />
      <FaqNewsletter contentTr={contentTr} contentEn={contentEn} />
      <ContactSection contentTr={contentTr} contentEn={contentEn} />
    </>
  )
}
