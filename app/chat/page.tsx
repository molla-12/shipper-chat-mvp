'use client'
import { useEffect, useState } from 'react'
import MessageList from '@/app/components/MessageList'
import ChatBox from '@/app/components/ChatBox'

interface User {
  id: string
  username: string
  name: string
  image?: string
}

export default function ChatPage() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string>('demo-user') // replace with JWT user id

  // Connect WebSocket
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001')
    socket.onopen = () => {
      console.log('Connected WS')
      socket.send(JSON.stringify({ type: 'SET_USER', userId }))
    }
    setWs(socket)
    return () => socket.close()
  }, [userId])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      setUsers(data.users.filter((u: User) => u.id !== userId))
    }
    fetchUsers()
  }, [userId])

  const sessionId = selectedUser
    ? [userId, selectedUser.id].sort().join('-')
    : null

  return (
    <div className="flex h-screen">
      {/* User list */}
      <div className="w-64 border-r p-4">
        <h3 className="font-bold mb-4">Users</h3>
        {users.map((u) => (
          <div
            key={u.id}
            className={`mb-2 p-2 rounded cursor-pointer ${
              selectedUser?.id === u.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => setSelectedUser(u)}
          >
            {u.name} ({u.username})
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser && sessionId ? (
          <>
            <div className="flex-1">
              <MessageList ws={ws} sessionId={sessionId} />
            </div>
            <ChatBox ws={ws} sessionId={sessionId} senderId={userId} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to chat
          </div>
        )}
      </div>
    </div>
  )
}
