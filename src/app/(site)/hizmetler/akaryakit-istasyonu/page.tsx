import { getPageContentBilingual } from '@/lib/content'
import AkaryakitIstasyonuClient from './AkaryakitIstasyonuClient'

export const revalidate = 300

export default async function AkaryakitIstasyonuPage() {
  const content = await getPageContentBilingual('akaryakit-istasyonu')
  return <AkaryakitIstasyonuClient initialContent={content} />
}
