import { getPageContentBilingual } from '@/lib/content'
import OzelTransferClient from './OzelTransferClient'

export const revalidate = 300

export default async function OzelTransferPage() {
  const content = await getPageContentBilingual('ozel-transfer')
  return <OzelTransferClient initialContent={content} />
}
