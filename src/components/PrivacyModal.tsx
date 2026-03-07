'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-[#161b22] rounded-xl shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#30363d] flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed overflow-y-auto">
          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">What we access</h3>
            <p>
              Read-only access to your Strava activities, profile, and clubs via Strava OAuth. This
              app never writes to or modifies your Strava data.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">What we store</h3>
            <p>
              Only a short-lived session token stored in an encrypted HTTP-only cookie (expires in
              30 days or on sign-out). There is no database. No personal data is stored on our
              servers.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Third-party services</h3>
            <p>
              Weather conditions are fetched from{' '}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Open-Meteo
              </a>{' '}
              (open-source, no personal data sent). Map tiles are served by{' '}
              <a
                href="https://openfreemap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                OpenFreeMap
              </a>
              .
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How to revoke access</h3>
            <p>
              Signing out removes your session immediately. To fully revoke access, visit{' '}
              <a
                href="https://www.strava.com/settings/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Strava Settings → My Apps
              </a>{' '}
              and disconnect Fitness Repo.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Data retention</h3>
            <p>
              All data is cleared when you sign out. There is no residual storage on our end.
            </p>
          </section>

          <p className="pt-1">
            For more information, see{' '}
            <a
              href="https://www.strava.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Strava&apos;s Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
