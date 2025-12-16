'use client'
import { useState } from 'react'


export default function ChatBox({ ws }: any) {
const [text, setText] = useState('')


const send = () => {
ws?.send(JSON.stringify({
type: 'MESSAGE',
content: text,
senderId: 'demo-user',
sessionId: 'demo-session',
}))
setText('')
}


return (
<div style={{ flex: 1, padding: 16 }}>
<input value={text} onChange={(e) => setText(e.target.value)} />
<button onClick={send}>Send</button>
</div>
)
}