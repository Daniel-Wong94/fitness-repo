'use client'

import { useState } from 'react'
import type { StravaActivity } from '@/lib/types'
import { MarathonCompareModal } from './MarathonCompareModal'
import { Award } from 'lucide-react'

export function MarathonCompareSection({ activities }: { activities: StravaActivity[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#30363d]
                   text-gray-600 dark:text-gray-400 hover:border-[var(--accent)]
                   hover:text-[var(--accent)] transition-colors"
      >
        <Award size={14} />
        Where do I rank?
      </button>
      <MarathonCompareModal
        isOpen={open}
        onClose={() => setOpen(false)}
        activities={activities}
      />
    </>
  )
}
