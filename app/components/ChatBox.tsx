'use client'
import { useState, KeyboardEvent } from 'react'

interface Props {
  ws: WebSocket | null
  sessionId: string
  senderId: string
}

export default function ChatBox({ ws, sessionId, senderId }: Props) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const sendMessage = async () => {
    if (!text.trim() || !ws || isSending) return

    const message = {
      type: 'MESSAGE',
      content: text.trim(),
      senderId,
      sessionId
    }

    console.log('Sending message:', message)

    try {
      setIsSending(true)
      
      // Send via WebSocket
      ws.send(JSON.stringify(message))
      
      // Clear input
      setText('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="border-t border-gray-300 bg-white p-4">
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSending}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || isSending}
          className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send • Shift + Enter for new line
      </p>
    </div>
  )
}