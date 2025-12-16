import { WebSocketServer } from 'ws'
import { prisma } from './lib/prisma'

const wss = new WebSocketServer({ port: 3001 })
const clients = new Map<string, any>()

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    const data = JSON.parse(raw.toString())

    if (data.type === 'JOIN') {
      clients.set(data.userId, ws)
      broadcastUsers()
    }

    if (data.type === 'MESSAGE') {
      const msg = await prisma.message.create({
        data: {
          content: data.content,
          senderId: data.senderId,
          sessionId: data.sessionId,
        },
      })

      broadcast({ type: 'MESSAGE', message: msg })
    }
  })

  ws.on('close', () => {
    for (const [id, socket] of clients.entries()) {
      if (socket === ws) clients.delete(id)
    }
    broadcastUsers()
  })
})

function broadcastUsers() {
  broadcast({ type: 'USERS', users: [...clients.keys()] })
}

function broadcast(data: any) {
  clients.forEach((ws) => ws.send(JSON.stringify(data)))
}

console.log('WS running on ws://localhost:3001')
