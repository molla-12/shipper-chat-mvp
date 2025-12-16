'use client'
import { useEffect, useState } from 'react'
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  id: string
  email: string
  name: string
}

export default function ChatPage() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [user, setUser] = useState<TokenPayload | null>(null)
  const [users, setUsers] = useState<string[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    const decoded = jwtDecode<TokenPayload>(token)
    setUser(decoded)

    const socket = new WebSocket('ws://localhost:3001')
    setWs(socket)

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'JOIN',
          userId: decoded.id,
          name: decoded.name,
        })
      )
    }

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'USERS') setUsers(data.users)
      if (data.type === 'MESSAGE') setMessages((m) => [...m, data.message])
    }

    return () => socket.close()
  }, [])

  const send = () => {
    if (!text || !user) return

    ws?.send(
      JSON.stringify({
        type: 'MESSAGE',
        content: text,
        senderId: user.id,
        sessionId: 'global-session',
      })
    )
    setText('')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 border-r bg-white p-4">
        <h3 className="mb-3 font-semibold">Users</h3>
        {users.map((u) => (
          <div key={u} className="text-sm">{u}</div>
        ))}
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id} className="mb-2">
              <span className="rounded bg-white px-3 py-2 shadow">
                {m.content}
              </span>
            </div>
          ))}
        </div>

        <div className="flex border-t bg-white p-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded border p-2"
            placeholder="Type message"
          />
          <button
            onClick={send}
            className="ml-3 rounded bg-black px-4 py-2 text-white"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  )
}
