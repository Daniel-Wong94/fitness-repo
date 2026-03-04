'use client'

import type { StravaActivity } from '@/lib/types'
import { computeStreak, computeBestStreak } from '@/lib/strava'
import { useSettings } from '@/lib/settings-context'

interface Props {
  activities: StravaActivity[]
  /** If provided, only show stats relevant to a single sport */
  sportMode?: boolean
  totalDistance?: number
  totalElevation?: number
}

export function StatsBar({ activities, sportMode, totalDistance, totalElevation }: Props) {
  const { settings } = useSettings()
  const { units } = settings

  const totalKudos = activities.reduce((sum, a) => sum + (a.kudos_count || 0), 0)
  const sportTypes = new Set(activities.map((a) => a.sport_type)).size
  const streak = computeStreak(activities)
  const bestStreak = computeBestStreak(activities)
  const lifetimeDistance = activities.reduce((s, a) => s + a.distance, 0)
  const lifetimeMovingTime = activities.reduce((s, a) => s + a.moving_time, 0)
  const lifetimeElevation = activities.reduce((s, a) => s + a.total_elevation_gain, 0)
  const totalAchievements = activities.reduce((s, a) => s + (a.achievement_count ?? 0), 0)

  function fmtDistance(meters: number) {
    if (units === 'imperial') {
      return `${(meters / 1609.344).toFixed(1)}mi`
    }
    return `${(meters / 1000).toFixed(0)}km`
  }

  function fmtElevation(meters: number) {
    if (units === 'imperial') return `${Math.round(meters * 3.28084)}ft`
    return `${Math.round(meters)}m`
  }

  function fmtTotalTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  const allStats = sportMode
    ? [
      {
        label: 'Activities',
        value: activities.length.toLocaleString(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z" />
          </svg>
        ),
      },
      totalDistance !== undefined && {
        label: 'Distance',
        value: fmtDistance(totalDistance),
        icon: <span className="text-sm">📏</span>,
      },
      totalElevation !== undefined && {
        label: 'Elevation',
        value: fmtElevation(totalElevation),
        icon: <span className="text-sm">⛰️</span>,
      },
      {
        label: 'Kudos',
        value: totalKudos.toLocaleString(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-yellow-500">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
          </svg>
        ),
      },
      {
        label: 'Day Streak',
        value: streak.toString(),
        icon: <span className="text-sm">🔥</span>,
      },
    ].filter(Boolean)
    : [
      {
        label: 'Activities',
        value: activities.length.toLocaleString(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25z" />
          </svg>
        ),
      },
      {
        label: 'Total Distance',
        value: fmtDistance(lifetimeDistance),
        icon: <span className="text-sm">📏</span>,
      },
      {
        label: 'Total Time',
        value: fmtTotalTime(lifetimeMovingTime),
        icon: <span className="text-sm">⏱️</span>,
      },
      {
        label: 'Total Elevation',
        value: fmtElevation(lifetimeElevation),
        icon: <span className="text-sm">⛰️</span>,
      },
      {
        label: 'Kudos',
        value: totalKudos.toLocaleString(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-yellow-500">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
          </svg>
        ),
      },
      {
        label: 'Sport Types',
        value: sportTypes.toLocaleString(),
        icon: <span className="text-sm">🏅</span>,
      },
      {
        label: 'Day Streak',
        value: streak.toString(),
        icon: <span className="text-sm">🔥</span>,
      },
      {
        label: 'Best Streak',
        value: bestStreak.toString(),
        icon: <span className="text-sm">⚡</span>,
      },
      totalAchievements > 0 && {
        label: 'Achievements',
        value: totalAchievements.toLocaleString(),
        icon: <span className="text-sm">🏆</span>,
      },
    ].filter(Boolean)

  const typedStats = allStats as { label: string; value: string; icon: React.ReactNode }[]

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Lifetime stats
      </h2>
      <div className="grid grid-cols-5 grid-rows-2 gap-3">
        {typedStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center px-4 py-3 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg"
          >
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
              {stat.icon}
              <span className="text-xs">{stat.label}</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
