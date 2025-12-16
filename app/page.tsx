'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginPage from './login/page'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      router.replace('/chat')
    }
  }, [router])

  return <LoginPage />
}
