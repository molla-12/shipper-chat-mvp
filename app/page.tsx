import LoginPage from './login/page'
import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/chat') // auto-redirect if logged in
  }

  return <LoginPage /> // otherwise render login page
}
