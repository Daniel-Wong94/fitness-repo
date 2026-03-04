'use client'

import Link from 'next/link'
import type { StravaActivity } from '@/lib/types'
import {
  getSportIcon,
  formatDistance,
  formatDuration,
  formatDate,
  getSportLabel,
} from '@/lib/strava'
import { ActivityBadge } from './ActivityBadge'
import { useSettings } from '@/lib/settings-context'

interface Props {
  activities: StravaActivity[]
  /** Max number of activities to show. Defaults to 20. Pass Infinity to show all. */
  limit?: number
}

export function ActivityFeed({ activities, limit = 20 }: Props) {
  const { settings } = useSettings()
  const shown = limit === Infinity ? activities : activities.slice(0, limit)

  if (shown.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm py-4">
        No activities found.
      </p>
    )
  }

  return (
    <ol className="border border-gray-200 dark:border-[#30363d] rounded-lg divide-y divide-gray-200 dark:divide-[#30363d] overflow-hidden">
      {shown.map((activity) => (
        <li
          key={activity.id}
          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors"
        >
          {/* Sport icon */}
          <div className="flex-shrink-0 mt-0.5 text-xl">
            {getSportIcon(activity.sport_type)}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-[#e6edf3] text-sm truncate">
                {activity.name}
              </span>
              <ActivityBadge visibility={activity.visibility} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-[#8b949e]">
              <span className="text-gray-400 dark:text-[#8b949e]">
                {getSportLabel(activity.sport_type)}
              </span>
              <span>·</span>
              <time dateTime={activity.start_date_local}>
                {formatDate(activity.start_date_local)}
              </time>
              {activity.distance > 0 && (
                <>
                  <span>·</span>
                  <span>{formatDistance(activity.distance, settings.units)}</span>
                </>
              )}
              {activity.moving_time > 0 && (
                <>
                  <span>·</span>
                  <span>{formatDuration(activity.moving_time)}</span>
                </>
              )}
            </div>
          </div>

          {/* Right-side meta */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1 text-xs text-gray-500 dark:text-[#8b949e]">
            {/* Kudos */}
            {activity.kudos_count > 0 && (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-yellow-500">
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
                </svg>
                {activity.kudos_count}
              </span>
            )}

            {/* Group workout partners (forks) */}
            {activity.athlete_count > 1 && (
              <span className="flex items-center gap-1" title="Workout partners">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0z" />
                </svg>
                {activity.athlete_count - 1}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
