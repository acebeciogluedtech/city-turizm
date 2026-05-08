import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { LanguageProvider } from '@/lib/language'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <Navbar />
      <main className="overflow-x-hidden">{children}</main>
      <Footer />
      <WhatsAppButton />
    </LanguageProvider>
  )
}
