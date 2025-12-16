'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })

    const data = await res.json()

    // ✅ store JWT
    localStorage.setItem('token', data.token)

    window.location.href = '/chat'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold">Shipper Chat</h1>

        <input
          className="mb-3 w-full rounded border p-3"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded border p-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded bg-black p-3 text-white"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}
