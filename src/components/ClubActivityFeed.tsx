'use client'

import { useState, useTransition } from 'react'
import type { ClubActivity } from '@/lib/types'
import { ClubActivityCard } from './ClubActivityCard'

const PER_PAGE = 10

interface Props {
  clubId: number
  initialActivities: ClubActivity[]
}

export function ClubActivityFeed({ clubId, initialActivities }: Props) {
  const [page, setPage] = useState(1)
  const [activities, setActivities] = useState<ClubActivity[]>(initialActivities)
  const [isPending, startTransition] = useTransition()

  const hasPrev = page > 1
  const hasNext = activities.length === PER_PAGE

  function goToPage(nextPage: number) {
    startTransition(async () => {
      const res = await fetch(`/api/clubs/${clubId}/activities?page=${nextPage}`)
      if (!res.ok) return
      const data: ClubActivity[] = await res.json()
      setActivities(data)
      setPage(nextPage)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Recent activity
        </h2>
        {(hasPrev || hasNext) && (
          <span className="text-xs text-gray-500 dark:text-[#8b949e]">Page {page}</span>
        )}
      </div>

      {activities.length === 0 && !isPending ? (
        <p className="text-sm text-gray-500 dark:text-[#8b949e]">No recent activity.</p>
      ) : (
        <div className={`space-y-3 transition-opacity duration-150 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          {activities.map((activity, i) => (
            <ClubActivityCard key={i} activity={activity} />
          ))}
        </div>
      )}

      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between mt-6">
          {hasPrev ? (
            <button
              onClick={() => goToPage(page - 1)}
              disabled={isPending}
              className="text-sm px-3 py-1.5 border border-gray-200 dark:border-[#30363d] rounded-md text-gray-700 dark:text-[#c9d1d9] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors disabled:opacity-50"
            >
              ← Previous
            </button>
          ) : (
            <div />
          )}
          {hasNext && (
            <button
              onClick={() => goToPage(page + 1)}
              disabled={isPending}
              className="text-sm px-3 py-1.5 border border-gray-200 dark:border-[#30363d] rounded-md text-gray-700 dark:text-[#c9d1d9] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors disabled:opacity-50"
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
