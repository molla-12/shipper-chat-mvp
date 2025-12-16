'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MessageList from '@/app/components/MessageList'
import ChatBox from '@/app/components/ChatBox'

interface User {
  id: string
  email: string
  name: string
  image?: string
}

export default function ChatClient({ user }: { user: User }) {
  const router = useRouter()
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const currentUser = user.id
  const currentUserName = user.name
  const currentUserEmail = user.email

  // Connect WebSocket
  useEffect(() => {
    if (!currentUser) return

    const socket = new WebSocket('ws://localhost:3001')

    socket.onopen = () => {
      console.log('✅ WebSocket connected')
      setIsConnected(true)
      socket.send(JSON.stringify({ type: 'SET_USER', userId: currentUser }))
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'USERS') {
        console.log('Online users:', data.users)
      }
    }

    socket.onerror = (error) => console.error('WebSocket error:', error)
    socket.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    setWs(socket)

    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close()
    }
  }, [currentUser])

  // Join session when user is selected
  useEffect(() => {
    if (ws && isConnected && selectedUser && currentUser) {
      const sessionId = [currentUser, selectedUser.id].sort().join('-')
      ws.send(JSON.stringify({ type: 'JOIN_SESSION', userId: currentUser, sessionId }))
    }
  }, [ws, isConnected, selectedUser, currentUser])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', { headers: { 'Content-Type': 'application/json' } })
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users.filter((u: User) => u.id !== currentUser))
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    if (currentUser) fetchUsers()
  }, [currentUser])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close()

      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/login')
        router.refresh()
      } else {
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const sessionId = selectedUser && currentUser ? [currentUser, selectedUser.id].sort().join('-') : null

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        {/* Header with logout */}
        <div className="p-4 border-b border-gray-300 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
              <div className="flex items-center mt-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>

          {/* Current user info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-gray-800">{currentUserName}</p>
            <p className="text-sm text-gray-600 truncate">{currentUserEmail}</p>
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto p-4">
          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">No other users online</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedUser(user)}
              >
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser && sessionId ? (
          <>
            <MessageList ws={ws} sessionId={sessionId} currentUserId={currentUser} />
            <ChatBox ws={ws} sessionId={sessionId} senderId={currentUser} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a user to start chatting</div>
        )}
      </div>
    </div>
  )
}
