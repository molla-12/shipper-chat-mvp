'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  // Get current user from localStorage or cookies
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Decode JWT to get user ID (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUser(payload.id)
        setCurrentUserName(payload.name)
        setCurrentUserEmail(payload.email)
      } catch (error) {
        console.error('Error decoding token:', error)
        // If token is invalid, redirect to login
        router.push('/login')
      }
    } else {
      // If no token, redirect to login
      router.push('/login')
    }
  }, [router])

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

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // 1. Close WebSocket connection
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
      
      // 2. Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // 3. Clear local storage
        localStorage.removeItem('token')
        
        // 4. Redirect to login page
        router.push('/login')
        router.refresh() // Refresh to update auth state
      } else {
        console.error('Logout API failed')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const sessionId = selectedUser && currentUser
    ? [currentUser, selectedUser.id].sort().join('-')
    : null

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
              <div className="flex items-center mt-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {/* Logout Button in Header */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Logout"
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </>
              )}
            </button>
          </div>
          
          {/* Current User Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {currentUserName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{currentUserName}</p>
                <p className="text-sm text-gray-600 truncate">{currentUserEmail}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Users List Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Online Users</h3>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
              {users.length} online
            </span>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 text-sm">No other users online</p>
              <p className="text-gray-400 text-xs mt-1">Invite friends to join!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedUser?.id === user.id 
                      ? 'bg-blue-100 border border-blue-300 shadow-sm' 
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  {selectedUser?.id === user.id && (
                    <div className="ml-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Logout Button at Bottom (Mobile-friendly) */}
        <div className="p-4 border-t border-gray-300 lg:hidden">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser && sessionId ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-500">Active now • {selectedUser.email}</p>
                  </div>
                </div>
                
                {/* Action buttons in chat header */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Add functionality for more actions
                      console.log('More actions')
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="More actions"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
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
            <div className="text-center max-w-md px-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Welcome to Chat App
              </h3>
              <p className="text-gray-600 mb-6">
                Select a user from the sidebar to start chatting. 
                Messages are encrypted and delivered in real-time.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Online Users</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Offline Users</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}