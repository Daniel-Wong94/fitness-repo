'use client'

import { useState } from 'react'
import type { StravaActivity } from '@/lib/types'
import { computeStreak, computeBestStreak } from '@/lib/strava'
import { useSettings } from '@/lib/settings-context'
import { ElevationModal } from './ElevationModal'
import { DistanceModal } from './DistanceModal'
import { KudosModal } from './KudosModal'
import { TimeModal } from './TimeModal'
import { ActivitiesModal } from './ActivitiesModal'
import {
  BookOpen,
  Ruler,
  Mountain,
  Star,
  Flame,
  Zap,
  Trophy,
  Timer,
} from 'lucide-react'

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
  const [elevationOpen, setElevationOpen] = useState(false)
  const [distanceOpen, setDistanceOpen] = useState(false)
  const [kudosOpen, setKudosOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [activitiesOpen, setActivitiesOpen] = useState(false)

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
        icon: <BookOpen size={14} />,
      },
      totalDistance !== undefined && {
        label: 'Distance',
        value: fmtDistance(totalDistance),
        icon: <Ruler size={14} />,
      },
      totalElevation !== undefined && {
        label: 'Elevation',
        value: fmtElevation(totalElevation),
        icon: <Mountain size={14} />,
      },
      {
        label: 'Kudos',
        value: totalKudos.toLocaleString(),
        icon: <Star size={14} className="text-yellow-500" />,
      },
      {
        label: 'Day Streak',
        value: streak.toString(),
        icon: <Flame size={14} className="text-orange-500" />,
      },
    ].filter(Boolean)
    : [
      {
        label: 'Activities',
        value: activities.length.toLocaleString(),
        icon: <BookOpen size={14} />,
        onClick: () => setActivitiesOpen(true),
      },
      {
        label: 'Total Distance',
        value: fmtDistance(lifetimeDistance),
        icon: <Ruler size={14} />,
        onClick: () => setDistanceOpen(true),
      },
      {
        label: 'Total Time',
        value: fmtTotalTime(lifetimeMovingTime),
        icon: <Timer size={14} />,
        onClick: () => setTimeOpen(true),
      },
      {
        label: 'Total Elevation',
        value: fmtElevation(lifetimeElevation),
        icon: <Mountain size={14} />,
        onClick: () => setElevationOpen(true),
      },
      {
        label: 'Kudos',
        value: totalKudos.toLocaleString(),
        icon: <Star size={14} className="text-yellow-500" />,
        onClick: () => setKudosOpen(true),
      },
      {
        label: 'Sport Types',
        value: sportTypes.toLocaleString(),
        icon: <Trophy size={14} />,
      },
      {
        label: 'Day Streak',
        value: streak.toString(),
        icon: <Flame size={14} className="text-orange-500" />,
      },
      {
        label: 'Best Streak',
        value: bestStreak.toString(),
        icon: <Zap size={14} className="text-yellow-500" />,
      },
      totalAchievements > 0 && {
        label: 'Achievements',
        value: totalAchievements.toLocaleString(),
        icon: <Trophy size={14} className="text-yellow-500" />,
      },
    ].filter(Boolean)

  const typedStats = allStats as { label: string; value: string; icon: React.ReactNode; onClick?: () => void }[]

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Lifetime Stats
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {typedStats.map((stat) =>
          stat.onClick ? (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className="flex flex-col justify-between items-center px-3 py-3 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg cursor-pointer hover:border-[var(--accent)] hover:bg-gray-100 dark:hover:bg-orange-950/30 dark:hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1.5">
                {stat.icon}
                <span className="text-xs">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
            </button>
          ) : (
            <div
              key={stat.label}
              className="flex flex-col justify-between items-center px-3 py-3 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg"
            >
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1.5">
                {stat.icon}
                <span className="text-xs">{stat.label}</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
            </div>
          )
        )}
      </div>
      <ElevationModal
        isOpen={elevationOpen}
        onClose={() => setElevationOpen(false)}
        activities={activities}
      />
      <DistanceModal
        isOpen={distanceOpen}
        onClose={() => setDistanceOpen(false)}
        activities={activities}
      />
      <KudosModal
        isOpen={kudosOpen}
        onClose={() => setKudosOpen(false)}
        activities={activities}
      />
      <TimeModal
        isOpen={timeOpen}
        onClose={() => setTimeOpen(false)}
        activities={activities}
      />
      <ActivitiesModal
        isOpen={activitiesOpen}
        onClose={() => setActivitiesOpen(false)}
        activities={activities}
      />
    </div>
  )
}
