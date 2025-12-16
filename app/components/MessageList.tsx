'use client'
import { useEffect, useState } from 'react'

interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    username: string
    image?: string
  }
}

interface Props {
  ws: WebSocket | null
  sessionId: string
}

export default function MessageList({ ws, sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!ws) return

    ws.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data)

      // Update user list separately if needed
      if (data.type === 'MESSAGE' && data.message.sessionId === sessionId) {
        setMessages((prev) => [...prev, data.message])
      }
    }
  }, [ws, sessionId])

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ height: '400px', border: '1px solid #ddd' }}>
      {messages.map((msg) => (
        <div key={msg.id} className="mb-2">
          <strong>{msg.sender.name}:</strong> {msg.content}
        </div>
      ))}
    </div>
  )
}
