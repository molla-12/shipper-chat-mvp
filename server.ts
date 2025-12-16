import 'dotenv/config'; 
import ws, { WebSocketServer } from 'ws'
import prisma from '@/app/lib/prisma'
const wss = new WebSocketServer({ port: 3001 })

// Track online users and their sessions
interface OnlineUser {
  ws: any
  userId: string
  sessions: string[] // sessions the user is part of
}

const onlineUsers = new Map<string, OnlineUser>()

wss.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', async (msg: string) => {
    try {
      const data = JSON.parse(msg)

      // 1️⃣ Set user ID when client connects
      if (data.type === 'SET_USER') {
        const { userId } = data
        if (!userId) return
        
        onlineUsers.set(userId, {
          ws,
          userId,
          sessions: []
        })
        
        console.log(`User ${userId} set as online`)
        broadcastUsers()
      }

      // 2️⃣ Handle JOIN_SESSION when user selects a chat
      if (data.type === 'JOIN_SESSION') {
        const { userId, sessionId } = data
        if (!userId || !sessionId) return
        
        const user = onlineUsers.get(userId)
        if (user && !user.sessions.includes(sessionId)) {
          user.sessions.push(sessionId)
          onlineUsers.set(userId, user)
          console.log(`User ${userId} joined session ${sessionId}`)
        }
      }

      // 3️⃣ Handle sending a message
      if (data.type === 'MESSAGE') {
        const { content, senderId, sessionId } = data
        console.log('Received message:', data)
        
        if (!senderId || !sessionId || !content) {
          console.error('Missing fields:', { senderId, sessionId, content })
          return
        }

        try {
          // Store message in DB
        const savedMessage = await prisma.message.create({
  data: {
    content,
    sender: {
      connect: { id: senderId } // Ensures the sender exists
    },
    session: {
      connectOrCreate: {
        where: { id: sessionId },
        create: { 
          id: sessionId,
          // If your Session model requires other fields (like title), add them here:
          // title: "New Chat", 
        }
      }
    }
  },
  include: {
    sender: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true
      }
    }
  }
})
          console.log('Message saved to DB:', savedMessage.id)

          // Find all users in this session
          const usersInSession: string[] = []
          onlineUsers.forEach((user, userId) => {
            if (user.sessions.includes(sessionId)) {
              usersInSession.push(userId)
            }
          })

          console.log(`Broadcasting to users in session ${sessionId}:`, usersInSession)

          // Send to all online users in this session (including sender)
          const messagePayload = JSON.stringify({
            type: 'MESSAGE',
            message: {
              ...savedMessage,
              createdAt: savedMessage.createdAt.toISOString()
            }
          })

          onlineUsers.forEach((user) => {
            if (user.sessions.includes(sessionId) && user.ws.readyState === 1) {
              console.log(`Sending to user ${user.userId}`)
              user.ws.send(messagePayload)
            }
          })

        } catch (dbError) {
          console.error('Database error:', dbError)
        }
      }

      // 4️⃣ Handle LEAVE_SESSION
      if (data.type === 'LEAVE_SESSION') {
        const { userId, sessionId } = data
        const user = onlineUsers.get(userId)
        if (user) {
          user.sessions = user.sessions.filter(s => s !== sessionId)
          onlineUsers.set(userId, user)
        }
      }

    } catch (err) {
      console.error('WebSocket message error:', err)
    }
  })

  ws.on('close', () => {
    // Find and remove this user
    let disconnectedUserId: string | null = null
    onlineUsers.forEach((user, userId) => {
      if (user.ws === ws) {
        disconnectedUserId = userId
      }
    })
    
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId)
      console.log(`User ${disconnectedUserId} disconnected`)
      broadcastUsers()
    }
  })
})

function broadcastUsers() {
  const users = Array.from(onlineUsers.keys())
  const payload = JSON.stringify({ 
    type: 'USERS', 
    users 
  })
  
  onlineUsers.forEach((user) => {
    if (user.ws.readyState === 1) {
      user.ws.send(payload)
    }
  })
}

console.log('✅ WebSocket server running on ws://localhost:3001')