'use client'

import Link from 'next/link'
import type { SportStats } from '@/lib/types'
import { getSportLabel, formatDistance } from '@/lib/strava'
import { useSettings } from '@/lib/settings-context'
import { SportIcon } from './SportIcon'
import { BookOpen, Star } from 'lucide-react'

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
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="text-gray-500 dark:text-gray-400">
            <SportIcon sport={sport.sport_type} size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[var(--accent)] group-hover:underline text-sm">
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

      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <BookOpen size={12} />
          {sport.count} {sport.count === 1 ? 'activity' : 'activities'}
        </span>
        {sport.total_distance > 0 && (
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500" />
            {sport.total_kudos} kudos
          </span>
        )}
        {sport.total_distance > 0 && (
          <span>{formatDistance(sport.total_distance, settings.units)}</span>
        )}
      </div>

      {/* Color bar */}
      <div className="mt-3 h-1 rounded-full bg-[var(--accent)] opacity-60" style={{ width: '100%' }} />
    </Link>
  )
}
