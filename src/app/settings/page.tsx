import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { SettingsPanel } from './SettingsPanel'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session?.access_token) redirect('/')
  return <SettingsPanel />
}
