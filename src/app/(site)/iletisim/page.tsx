import { getPageContentBilingual } from '@/lib/content'
import IletisimClient from './IletisimClient'

export const revalidate = 300

export default async function IletisimPage() {
  const content = await getPageContentBilingual('iletisim')
  return <IletisimClient initialContent={content} />
}
