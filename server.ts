import WebSocket, { WebSocketServer } from 'ws'
import prisma from './app/lib/prisma'

const wss = new WebSocketServer({ port: 3001 })

// Track online users
let onlineUsers: { [id: string]: WebSocket } = {}

wss.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', async (msg) => {
    const data = JSON.parse(msg.toString())

    if (data.type === 'SET_USER') {
      onlineUsers[data.userId] = ws
      broadcastUsers()
    }

    if (data.type === 'MESSAGE') {
      const { content, senderId, sessionId } = data

      // 1️⃣ Store message in DB
      const savedMessage = await prisma.message.create({
        data: {
          content,
          senderId,
          sessionId,
        },
        include: { sender: { select: { id: true, username: true, name: true, image: true } } },
      })

      // 2️⃣ Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'MESSAGE',
            message: savedMessage,
          }))
        }
      })
    }
  })

  ws.on('close', () => {
    // Remove user from online list
    for (let id in onlineUsers) {
      if (onlineUsers[id] === ws) delete onlineUsers[id]
    }
    broadcastUsers()
  })
})

// Broadcast online users
function broadcastUsers() {
  const users = Object.keys(onlineUsers)
  const payload = JSON.stringify({ type: 'USERS', users })
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(payload)
  })
}

console.log('WebSocket server running on ws://localhost:3001')
