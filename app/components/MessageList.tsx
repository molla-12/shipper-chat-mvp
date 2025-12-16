'use client'
import { useEffect, useState, useRef } from 'react'

interface Message {
  id: string
  content: string
  senderId: string
  sessionId: string
  createdAt: string
  sender: { 
    id: string; 
    name: string; 
    email: string;
    image?: string;
  }
}

interface Props {
  ws: WebSocket | null
  sessionId: string
  currentUserId: string
}

export default function MessageList({ ws, sessionId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!sessionId) return
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/messages?sessionId=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }
    fetchMessages()
  }, [sessionId])

  // Listen for new messages
  useEffect(() => {
    if (!ws) return

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'MESSAGE' && data.message.sessionId === sessionId) {
          setMessages(prev => [...prev, data.message])
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    ws.addEventListener('message', handleMessage)
    return () => ws.removeEventListener('message', handleMessage)
  }, [ws, sessionId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-full overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUserId
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-300 rounded-tl-none'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="flex items-center mb-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                        {msg.sender.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{msg.sender.name}</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}