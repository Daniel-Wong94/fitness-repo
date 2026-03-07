'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Activity, Coffee } from 'lucide-react'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
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
        className="relative w-full max-w-md mx-4 bg-white dark:bg-[#161b22] rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#30363d]">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fitness Repo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            <span className="font-semibold text-gray-900 dark:text-white">Fitness Repo</span> is a
            GitHub-style dashboard for your Strava activity data. It visualizes your workout history
            as a contribution heatmap, surfaces per-sport (repo) stats, and awards fun trophies based on
            your real training patterns.
          </p>
          <p>
            Connect once with your Strava account, this app is read-only and never modifies your
            data. No database, no tracking, no ads.
          </p>
          <p>
            Built with Next.js, Tailwind CSS, and powered by Strava.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-center">
          <a
            href="https://www.buymeacoffee.com/daniel_wong"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Coffee size={16} />
            Buy me a coffee
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
