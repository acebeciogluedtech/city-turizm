import { getPageContentBilingual } from '@/lib/content'
import AracFilosuClient from './AracFilosuClient'

export const revalidate = 300

export default async function AracFilosuPage() {
  const content = await getPageContentBilingual('arac-filosu')
  return <AracFilosuClient initialContent={content} />
}
