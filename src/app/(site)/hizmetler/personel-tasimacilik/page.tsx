import { getPageContentBilingual } from '@/lib/content'
import PersonelTasimacilikClient from './PersonelTasimacilikClient'

export const revalidate = 300

export default async function PersonelTasimacilikPage() {
  const content = await getPageContentBilingual('personel-tasimacilik')
  return <PersonelTasimacilikClient initialContent={content} />
}
