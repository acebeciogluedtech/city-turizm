import { getPageContentBilingual } from '@/lib/content'
import KullanimKosullariClient from './KullanimKosullariClient'

export const revalidate = 300

export default async function KullanimKosullariPage() {
  const content = await getPageContentBilingual('kullanim-kosullari')
  return <KullanimKosullariClient initialContent={content} />
}
