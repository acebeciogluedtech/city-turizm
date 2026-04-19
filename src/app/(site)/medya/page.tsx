import { getPageContentBilingual } from '@/lib/content'
import MedyaClient from './MedyaClient'

export const revalidate = 300

export default async function MedyaPage() {
  const content = await getPageContentBilingual('medya')
  return <MedyaClient initialContent={content} />
}
