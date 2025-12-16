'use client'
import { useState } from 'react'


export default function LoginPage() {
const [email, setEmail] = useState('')
const [name, setName] = useState('')


const login = async () => {
const res = await fetch('/api/auth/login', {
method: 'POST',
body: JSON.stringify({ email, name }),
})


const data = await res.json()
localStorage.setItem('token', data.token)
window.location.href = '/chat'
}


return (
<div style={{ padding: 40 }}>
<h2>Login</h2>
<input placeholder="Name" onChange={e => setName(e.target.value)} />
<input placeholder="Email" onChange={e => setEmail(e.target.value)} />
<button onClick={login}>Login</button>
</div>
)
}