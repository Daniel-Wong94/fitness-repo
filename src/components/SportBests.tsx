'use client'

import { formatDistance, formatPace, formatSpeed, formatElevation } from '@/lib/strava'
import { useSettings } from '@/lib/settings-context'

interface BestActivity {
  name: string
}

interface BestDistanceActivity extends BestActivity {
  distance: number
}

interface BestSpeedActivity extends BestActivity {
  average_speed: number
}

interface BestElevationActivity extends BestActivity {
  total_elevation_gain: number
}

interface Props {
  longestActivity: BestDistanceActivity | null
  fastestActivity: BestSpeedActivity | null
  mostElevationActivity: BestElevationActivity | null
  isPaceSport: boolean
}

export function SportBests({
  longestActivity,
  fastestActivity,
  mostElevationActivity,
  isPaceSport,
}: Props) {
  const { settings } = useSettings()
  const { units } = settings

  if (!longestActivity && !fastestActivity && !mostElevationActivity) return null

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Bests (last 52 weeks)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {longestActivity && (
          <div className="p-4 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              📏 Longest
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatDistance(longestActivity.distance, units)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {longestActivity.name}
            </p>
          </div>
        )}

        {fastestActivity && (
          <div className="p-4 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              ⚡ Fastest
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {isPaceSport
                ? formatPace(fastestActivity.average_speed, units)
                : formatSpeed(fastestActivity.average_speed, units)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {fastestActivity.name}
            </p>
          </div>
        )}

        {mostElevationActivity && (
          <div className="p-4 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              ⛰️ Most elevation
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatElevation(mostElevationActivity.total_elevation_gain, units)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {mostElevationActivity.name}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
