import { getPageContentBilingual } from '@/lib/content'
import DuyurularClient from './DuyurularClient'

export const revalidate = 300

export default async function DuyurularPage() {
  const content = await getPageContentBilingual('duyurular')
  return <DuyurularClient initialContent={content} />
}
