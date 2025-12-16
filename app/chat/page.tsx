import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login') // Redirect if not logged in
  }

  // Pass user info to client component
  return <ChatClient user={user} />
}
