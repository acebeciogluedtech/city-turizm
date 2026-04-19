import { getPageContentBilingual } from '@/lib/content'
import AracKiralamaClient from './AracKiralamaClient'

export const revalidate = 300

export default async function AracKiralamaPage() {
  const content = await getPageContentBilingual('arac-kiralama')
  return <AracKiralamaClient initialContent={content} />
}
