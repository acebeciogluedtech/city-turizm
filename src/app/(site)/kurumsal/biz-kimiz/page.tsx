import { getPageContentBilingual } from '@/lib/content'
import BizKimizClient from './BizKimizClient'

export const revalidate = 300

export default async function BizKimizPage() {
  const content = await getPageContentBilingual('biz-kimiz')
  return <BizKimizClient initialContent={content} />
}
