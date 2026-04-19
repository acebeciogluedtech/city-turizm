import { getPageContentBilingual } from '@/lib/content'
import CevreSuPolitikalariClient from './CevreSuPolitikalariClient'

export const revalidate = 300

export default async function CevreSuPolitikalariPage() {
  const content = await getPageContentBilingual('cevre-su-politikalari')
  return <CevreSuPolitikalariClient initialContent={content} />
}
