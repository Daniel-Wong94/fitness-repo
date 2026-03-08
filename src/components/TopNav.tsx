'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { GitFitLogo } from '@/components/GitFitLogo'
import { Settings, Info, Lock, HelpCircle, User } from 'lucide-react'
import { SettingsModal } from './modal/SettingsModal'
import { InfoModal } from './modal/InfoModal'
import { PrivacyModal } from './modal/PrivacyModal'
import type { StravaAthlete } from '@/lib/types'

interface TopNavProps {
  athlete?: StravaAthlete
  sticky?: boolean
}

export function TopNav({ athlete, sticky = true }: TopNavProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  function startTutorial() {
    localStorage.removeItem('strava_tutorial_seen')
    window.dispatchEvent(new CustomEvent('start-tutorial'))
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <header className={`${sticky ? 'sticky top-0 z-40' : ''} border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]`}>
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Left: logo */}
        <Link href="/dashboard" className="shrink-0">
          <span className="block dark:hidden"><GitFitLogo width={86} variant="light" /></span>
          <span className="hidden dark:block"><GitFitLogo width={86} variant="dark" /></span>
        </Link>

        {/* Right: icon buttons + avatar */}
        <div className="flex items-center gap-0.5">
          {isDashboard && (
            <button
              onClick={startTutorial}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
              aria-label="Start tour"
              title="Start tour"
            >
              <HelpCircle size={18} />
            </button>
          )}

          <button
            onClick={() => setPrivacyOpen(true)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
            aria-label="Privacy policy"
          >
            <Lock size={18} />
          </button>

          <button
            onClick={() => setInfoOpen(true)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
            aria-label="About"
          >
            <Info size={18} />
          </button>

          <button
            data-tour="settings-btn"
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 dark:bg-[#30363d] mx-2" />

          {/* Avatar dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              data-tour="avatar-btn"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center rounded-full ring-2 ring-transparent hover:ring-[var(--accent)]/60 transition-all focus:outline-none"
              aria-label="Open user menu"
              aria-expanded={menuOpen}
            >
              {athlete?.profile_medium ? (
                <Image
                  src={athlete.profile_medium}
                  alt={`${athlete.firstname} ${athlete.lastname}`}
                  width={32}
                  height={32}
                  className="rounded-full w-8 h-8 object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#30363d] flex items-center justify-center">
                  <User size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg shadow-xl overflow-hidden z-50">
                {athlete && (
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-[#30363d]">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {athlete.firstname} {athlete.lastname}
                    </p>
                  </div>
                )}
                <div className="py-1">
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </header>
  )
}
