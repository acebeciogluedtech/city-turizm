import { getPageContentBilingual } from '@/lib/content'
import SirketProfiliClient from './SirketProfiliClient'

export const revalidate = 300

export default async function SirketProfiliPage() {
  const content = await getPageContentBilingual('sirket-profili')
  return <SirketProfiliClient initialContent={content} />
}
