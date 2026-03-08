import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'
import { GitFitLogo } from '@/components/GitFitLogo'
import { LayoutGrid, Award, Flame, Github, Linkedin } from 'lucide-react'

const FEATURES = [
  {
    icon: <LayoutGrid size={20} className="text-[#FC4C02]" />,
    title: 'Activity Heatmap',
    desc: '52-week contribution grid for every sport',
  },
  {
    icon: <Award size={20} className="text-[#FC4C02]" />,
    title: 'Sport Cards',
    desc: 'Per-sport repo cards with PRs, totals & bests',
  },
  {
    icon: <Flame size={20} className="text-[#FC4C02]" />,
    title: 'Streaks & Stats',
    desc: 'Kudos, streaks, elevation and more at a glance',
  },
]

export default function LandingPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">

      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 max-w-screen-xl mx-auto w-full">
        <GitFitLogo width={110} variant="dark" />
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Daniel-Wong94"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/daniel-kachun-wong/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center px-8 max-w-screen-xl mx-auto w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 border border-white/15 rounded-full px-3 py-1 text-xs text-gray-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FC4C02]" />
              Powered by Strava
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              Your fitness,<br />
              <span className="text-[#FC4C02]">visualized.</span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-md">
              A GitHub-style dashboard for your Strava activities. Heatmaps, streaks, sport cards, and lifetime stats — all in one place.
            </p>

            {searchParams.error && (
              <div className="mb-8 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {searchParams.error === 'access_denied'
                  ? 'Access was denied. Please try again.'
                  : 'Something went wrong. Please try again.'}
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <ConnectButton />
            </div>

            <p className="mt-5 text-xs text-gray-600">
              Read-only access · No data stored
            </p>
          </div>

          {/* Right — feature cards */}
          <div className="flex flex-col gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/8 hover:border-[#FC4C02]/40 hover:bg-white/8 transition-colors"
              >
                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-md bg-[#FC4C02]/10 flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 max-w-screen-xl mx-auto w-full border-t border-white/8 flex items-center justify-between text-xs text-gray-600">
        <span>Built by{' '}
          <a
            href="https://www.linkedin.com/in/daniel-kachun-wong/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Daniel Wong
          </a>
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Daniel-Wong94"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/daniel-kachun-wong/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  )
}
