'use client'

import type { StravaActivity, StravaAthlete } from '@/lib/types'
import { computeStreak } from '@/lib/strava'
import { useSettings } from '@/lib/settings-context'

interface Props {
  activities: StravaActivity[]
  athlete?: StravaAthlete
  /** If provided, only show stats relevant to a single sport */
  sportMode?: boolean
  totalDistance?: number
  totalElevation?: number
}

export function StatsBar({ activities, athlete, sportMode, totalDistance, totalElevation }: Props) {
  const { settings } = useSettings()
  const { units } = settings

  const totalKudos = activities.reduce((sum, a) => sum + (a.kudos_count || 0), 0)
  const sportTypes = new Set(activities.map((a) => a.sport_type)).size
  const streak = computeStreak(activities)

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

  const baseStats = [
    {
      label: 'Activities',
      value: activities.length.toLocaleString(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z" />
        </svg>
      ),
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
  ]

  const conditionalStats = sportMode
    ? [
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
      ].filter(Boolean)
    : [
        {
          label: 'Sport Types',
          value: sportTypes.toLocaleString(),
          icon: <span className="text-sm">🏅</span>,
        },
      ]

  const peopleIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5zM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5z" />
    </svg>
  )

  const sharedStats = [
    ...(athlete ? [
      {
        label: 'Followers',
        value: (athlete.follower_count ?? 0).toLocaleString(),
        icon: peopleIcon,
      },
      {
        label: 'Following',
        value: (athlete.friend_count ?? 0).toLocaleString(),
        icon: peopleIcon,
      },
    ] : []),
    {
      label: 'Day Streak',
      value: streak.toString(),
      icon: <span className="text-sm">🔥</span>,
    },
  ]

  const allStats = [...baseStats, ...conditionalStats, ...sharedStats].filter(
    Boolean
  ) as { label: string; value: string; icon: React.ReactNode }[]

  return (
    <div className="flex flex-wrap gap-3">
      {allStats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center px-4 py-3 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg min-w-[80px]"
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
  )
}
