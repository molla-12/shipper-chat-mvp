'use client'
import { useState } from 'react'

interface Props {
  ws: WebSocket | null
  sessionId: string
  senderId: string
}

export default function ChatBox({ ws, sessionId, senderId }: Props) {
  const [text, setText] = useState('')

  const send = () => {
    if (!text.trim() || !ws) return

    ws.send(
      JSON.stringify({
        type: 'MESSAGE',
        content: text,
        senderId,
        sessionId,
      })
    )
    setText('')
  }

  return (
    <div className="flex p-2 border-t">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded p-2 mr-2"
        placeholder="Type a message..."
      />
      <button onClick={send} className="bg-black text-white px-4 rounded">
        Send
      </button>
    </div>
  )
}
