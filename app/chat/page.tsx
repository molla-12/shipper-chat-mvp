'use client'
import { useEffect, useState } from 'react'
import UserList from '../components/UserList'
import ChatBox from '../components/ChatBox'


export default function ChatPage() {
const [ws, setWs] = useState<WebSocket | null>(null)


useEffect(() => {
const socket = new WebSocket('ws://localhost:3001')
setWs(socket)
return () => socket.close()
}, [])


return (
<div style={{ display: 'flex', height: '100vh' }}>
<UserList ws={ws} />
<ChatBox ws={ws} />
</div>
)
}