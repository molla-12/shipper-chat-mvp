'use client'
import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  image?: string
}

export default function UserList({ ws }: any) {
  const [users, setUsers] = useState<User[]>([])

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      setUsers(data.users || [])
    }
    fetchUsers()
  }, [])

  // Optional: update online status via WS
  useEffect(() => {
    if (!ws) return
    ws.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data)
      if (data.type === 'USERS') setUsers(data.users)
    }
  }, [ws])

  return (
    <div className="w-64 border-r p-4">
      <h3 className="font-bold mb-4">Users</h3>
      {users.map((u) => (
        <div key={u.id} className="mb-2">
          {u.name} ({u.email})
        </div>
      ))}
    </div>
  )
}
