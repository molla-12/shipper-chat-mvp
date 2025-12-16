'use client'
import { useEffect, useState } from 'react'


export default function UserList({ ws }: any) {
const [users, setUsers] = useState<string[]>([])


useEffect(() => {
if (!ws) return
ws.onmessage = (e: any) => {
const data = JSON.parse(e.data)
if (data.type === 'USERS') setUsers(data.users)
}
}, [ws])


return (
<div style={{ width: 250, borderRight: '1px solid #ddd' }}>
<h3>Users</h3>
{users.map((u) => (
<div key={u}>{u} (online)</div>
))}
</div>
)
}