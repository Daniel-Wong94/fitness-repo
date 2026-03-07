import { Activity } from 'lucide-react'

export function ConnectButton() {
  return (
    <a
      href="/api/auth/strava"
      className="inline-flex items-center gap-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg shadow-lg"
    >
      <Activity size={22} />
      Connect with Strava
    </a>
  )
}
