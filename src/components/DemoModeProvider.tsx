'use client'

import { createContext, useContext, useState } from 'react'
import Image from 'next/image'

interface DemoModeContextValue {
  isDemo: boolean
  showDemoModal: () => void
}

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemo: false,
  showDemoModal: () => {},
})

export function useDemoMode() {
  return useContext(DemoModeContext)
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <DemoModeContext.Provider value={{ isDemo: true, showDemoModal: () => setOpen(true) }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl mb-4">🏃</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              You're in demo mode
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Connect your Strava account to explore your real activities, clubs, and personal stats.
            </p>
            <a href="/api/auth/strava" className="inline-block hover:opacity-90 transition-opacity mb-3">
              <Image
                src="/btn_strava_connect_orange.svg"
                alt="Connect with Strava"
                width={193}
                height={48}
                priority
              />
            </a>
            <br />
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Continue browsing demo
            </button>
          </div>
        </div>
      )}
    </DemoModeContext.Provider>
  )
}
