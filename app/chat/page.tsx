'use client'
import { useEffect, useState, useCallback } from 'react'
import MessageList from '@/app/components/MessageList'
import ChatBox from '@/app/components/ChatBox'

interface User {
  id: string
  email: string
  name: string
  image?: string
}

export default function ChatPage() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)

  // Get current user from localStorage or cookies
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Decode JWT to get user ID (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUser(payload.id)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [])

  // Connect WebSocket
  useEffect(() => {
    if (!currentUser) return

    const socket = new WebSocket('ws://localhost:3001')
    
    socket.onopen = () => {
      console.log('✅ WebSocket connected')
      setIsConnected(true)
      socket.send(JSON.stringify({ 
        type: 'SET_USER', 
        userId: currentUser 
      }))
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'USERS') {
        console.log('Online users:', data.users)
        // You might want to update online status here
      }
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    setWs(socket)

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [currentUser])

  // Join session when user is selected
  useEffect(() => {
    if (ws && isConnected && selectedUser && currentUser) {
      const sessionId = [currentUser, selectedUser.id].sort().join('-')
      ws.send(JSON.stringify({ 
        type: 'JOIN_SESSION', 
        userId: currentUser, 
        sessionId 
      }))
    }
  }, [ws, isConnected, selectedUser, currentUser])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/users', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        })
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users.filter((u: User) => u.id !== currentUser))
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  const sessionId = selectedUser && currentUser
    ? [currentUser, selectedUser.id].sort().join('-')
    : null

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-700 mb-4">Online Users</h3>
          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">No other users found</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition ${
                  selectedUser?.id === user.id 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser && sessionId ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-300 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">@{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList 
                ws={ws} 
                sessionId={sessionId} 
                currentUserId={currentUser} 
              />
            </div>

            {/* Input */}
            <ChatBox 
              ws={ws} 
              sessionId={sessionId} 
              senderId={currentUser} 
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select a user to chat
              </h3>
              <p className="text-gray-500">
                Choose someone from the sidebar to start a conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}