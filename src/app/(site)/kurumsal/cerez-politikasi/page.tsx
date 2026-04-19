import { getPageContentBilingual } from '@/lib/content'
import CerezPolitikasiClient from './CerezPolitikasiClient'

export const revalidate = 300

export default async function CerezPolitikasiPage() {
  const content = await getPageContentBilingual('cerez-politikasi')
  return <CerezPolitikasiClient initialContent={content} />
}
