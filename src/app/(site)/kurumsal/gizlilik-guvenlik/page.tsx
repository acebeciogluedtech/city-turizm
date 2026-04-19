import { getPageContentBilingual } from '@/lib/content'
import GizlilikGuvenlikClient from './GizlilikGuvenlikClient'

export const revalidate = 300

export default async function GizlilikGuvenlikPage() {
  const content = await getPageContentBilingual('gizlilik-guvenlik')
  return <GizlilikGuvenlikClient initialContent={content} />
}
