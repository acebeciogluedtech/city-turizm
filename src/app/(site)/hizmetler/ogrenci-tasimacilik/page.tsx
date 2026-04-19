import { getPageContentBilingual } from '@/lib/content'
import OgrenciTasimacilikClient from './OgrenciTasimacilikClient'

export const revalidate = 300

export default async function OgrenciTasimacilikPage() {
  const content = await getPageContentBilingual('ogrenci-tasimacilik')
  return <OgrenciTasimacilikClient initialContent={content} />
}
