'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RehberBasvuruPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/basvuru') }, [router])
  return null
}
