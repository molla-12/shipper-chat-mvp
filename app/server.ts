import { WebSocketServer } from 'ws'
import { prisma } from './lib/prisma'


const wss = new WebSocketServer({ port: 3001 })
const onlineUsers = new Map()


wss.on('connection', (ws: any) => {
ws.on('message', async (data: string) => {
const msg = JSON.parse(data)


if (msg.type === 'JOIN') {
onlineUsers.set(msg.userId, ws)
broadcastUsers()
}


if (msg.type === 'MESSAGE') {
const message = await prisma.message.create({
data: {
content: msg.content,
senderId: msg.senderId,
sessionId: msg.sessionId,
},
})


onlineUsers.forEach((client) => {
client.send(JSON.stringify({ type: 'MESSAGE', message }))
})
}
})


ws.on('close', () => {
for (const [id, socket] of onlineUsers.entries()) {
if (socket === ws) onlineUsers.delete(id)
}
broadcastUsers()
})
})


function broadcastUsers() {
const users = Array.from(onlineUsers.keys())
onlineUsers.forEach((ws) =>
ws.send(JSON.stringify({ type: 'USERS', users }))
)
}


console.log('WebSocket running on ws://localhost:3001')