import { getPageContentBilingual } from '@/lib/content'
import KvkkClient from './KvkkClient'

export const revalidate = 300

export default async function KVKKPage() {
  const content = await getPageContentBilingual('kvkk')
  return <KvkkClient initialContent={content} />
}
