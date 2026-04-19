import { getPageContentBilingual } from '@/lib/content'
import KalitePolitikasiClient from './KalitePolitikasiClient'

export const revalidate = 300

export default async function KalitePolitikasiPage() {
  const content = await getPageContentBilingual('kalite-politikasi')
  return <KalitePolitikasiClient initialContent={content} />
}
