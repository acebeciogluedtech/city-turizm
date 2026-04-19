import { getPageContentBilingual } from '@/lib/content'
import BaskaninMesajiClient from './BaskaninMesajiClient'

export const revalidate = 300

export default async function BaskaninMesajiPage() {
  const content = await getPageContentBilingual('baskanin-mesaji')
  return <BaskaninMesajiClient initialContent={content} />
}
