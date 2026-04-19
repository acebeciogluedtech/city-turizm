import { getPageContentBilingual } from '@/lib/content'
import TurizmAcenteligiClient from './TurizmAcenteligiClient'

export const revalidate = 300

export default async function TurizmAcenteligiPage() {
  const content = await getPageContentBilingual('turizm-acenteligi')
  return <TurizmAcenteligiClient initialContent={content} />
}
