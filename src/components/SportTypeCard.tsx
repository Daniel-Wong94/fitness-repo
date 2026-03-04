'use client'

import Link from 'next/link'
import type { SportStats } from '@/lib/types'
import { getSportIcon, getSportLabel, formatDistance } from '@/lib/strava'
import { useSettings } from '@/lib/settings-context'

interface Props {
  sport: SportStats
  pinned?: boolean
}

export function SportTypeCard({ sport, pinned }: Props) {
  const { settings } = useSettings()

  return (
    <Link
      href={`/dashboard/sport/${encodeURIComponent(sport.sport_type)}`}
      className="group block p-4 border border-gray-200 dark:border-[#30363d] rounded-lg hover:border-gray-400 dark:hover:border-[#8b949e] bg-white dark:bg-[#0d1117] transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getSportIcon(sport.sport_type)}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#FC4C02] group-hover:underline text-sm">
                {getSportLabel(sport.sport_type)}
              </span>
              {pinned && (
                <span className="text-xs border border-gray-300 dark:border-[#30363d] text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                  pinned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z" />
          </svg>
          {sport.count} {sport.count === 1 ? 'activity' : 'activities'}
        </span>
        {sport.total_distance > 0 && (
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" clipRule="evenodd" />
            </svg>
            {sport.total_kudos} kudos
          </span>
        )}
        {sport.total_distance > 0 && (
          <span>{formatDistance(sport.total_distance, settings.units)}</span>
        )}
      </div>

      {/* Sport type color bar */}
      <div className="mt-3 h-1 rounded-full bg-[#FC4C02] opacity-60" style={{ width: '100%' }} />
    </Link>
  )
}
