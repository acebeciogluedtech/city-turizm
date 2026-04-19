import { getPageContentBilingual } from '@/lib/content'
import IsSagligiGuvenligiClient from './IsSagligiGuvenligiClient'

export const revalidate = 300

export default async function IsSagligiGuvenligi() {
  const content = await getPageContentBilingual('is-sagligi-guvenligi')
  return <IsSagligiGuvenligiClient initialContent={content} />
}
