'use client'

import type { ClubActivity } from '@/lib/types'
import { useSettings } from '@/lib/settings-context'
import { getSportIcon, formatDistance, formatDuration, formatElevation } from '@/lib/strava'

interface Props {
  activity: ClubActivity
}

export function ClubActivityCard({ activity }: Props) {
  const { settings } = useSettings()
  const { units } = settings
  const athleteName = `${activity.athlete.firstname} ${activity.athlete.lastname[0]}.`

  return (
    <div className="border border-gray-200 dark:border-[#30363d] rounded-lg p-3 flex gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#21262d] flex items-center justify-center text-lg flex-shrink-0">
        {getSportIcon(activity.sport_type)}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-900 dark:text-[#e6edf3] truncate">
          <span className="font-medium">{athleteName}</span>
          {' · '}
          {activity.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-0.5">
          {activity.distance > 0 && <span>{formatDistance(activity.distance, units)}</span>}
          {activity.distance > 0 && activity.moving_time > 0 && <span className="mx-1">·</span>}
          {activity.moving_time > 0 && <span>{formatDuration(activity.moving_time)}</span>}
          {activity.total_elevation_gain > 0 && (
            <>
              <span className="mx-1">·</span>
              <span>{formatElevation(activity.total_elevation_gain, units)} elev</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
