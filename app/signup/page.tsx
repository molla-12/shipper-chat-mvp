'use client'
import { useState } from 'react'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const signup = async () => {
    if (!username || !password || !name) {
      alert('All fields are required')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) {
      alert(data.error)
      return
    }

    localStorage.setItem('token', data.token)
    window.location.href = '/chat'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-bold text-center">Sign Up</h1>

        <input
          className="mb-3 w-full rounded border p-3"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="mb-3 w-full rounded border p-3"
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          className="mb-4 w-full rounded border p-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signup}
          disabled={loading}
          className="w-full rounded bg-black p-3 text-white"
        >
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-blue-500">Login</a>
        </p>
      </div>
    </div>
  )
}
