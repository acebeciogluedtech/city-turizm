import { getPageContentBilingual } from '@/lib/content'
import InsanKaynaklariClient from './InsanKaynaklariClient'

export const revalidate = 300

export default async function InsanKaynaklariPage() {
  const content = await getPageContentBilingual('insan-kaynaklari')
  return <InsanKaynaklariClient initialContent={content} />
}
