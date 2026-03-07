'use client'

import { useSettings } from '@/lib/settings-context'
import { formatDistance, formatDuration, formatPace, formatSpeed, formatElevation } from '@/lib/strava'
import {
  Ruler,
  Timer,
  Clock,
  Mountain,
  Footprints,
  Bike,
  Heart,
  HeartPulse,
  Flame,
  Gauge,
  Trophy,
  Medal,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'

const PACE_SPORTS = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike', 'Swim'])

function hrColor(avg: number, max: number): string {
  if (!max) return ''
  const ratio = avg / max
  if (ratio < 0.6) return 'text-green-600 dark:text-green-400'
  if (ratio < 0.7) return 'text-blue-600 dark:text-blue-400'
  if (ratio < 0.8) return 'text-yellow-600 dark:text-yellow-400'
  if (ratio < 0.9) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

interface Props {
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  suffer_score?: number
  achievement_count?: number
  pr_count?: number
  sport_type: string
  gear_distance?: number
}

export function ActivityStatsChips(props: Props) {
  const { settings } = useSettings()
  const { units } = settings
  const isPace = PACE_SPORTS.has(props.sport_type)

  const chips: { label: string; value: string; Icon: ComponentType<LucideProps>; colorClass?: string; iconClass?: string }[] = []

  if (props.distance > 0) {
    chips.push({ label: 'Distance', value: formatDistance(props.distance, units), Icon: Ruler })
  }
  chips.push({ label: 'Moving Time', value: formatDuration(props.moving_time), Icon: Timer })
  if (props.elapsed_time !== props.moving_time) {
    chips.push({ label: 'Elapsed Time', value: formatDuration(props.elapsed_time), Icon: Clock })
  }
  if (props.total_elevation_gain > 0) {
    chips.push({ label: 'Elevation', value: formatElevation(props.total_elevation_gain, units), Icon: Mountain })
  }
  if (props.distance > 0 && props.moving_time > 0) {
    const speed = props.distance / props.moving_time
    chips.push({
      label: isPace ? 'Pace' : 'Speed',
      value: isPace ? formatPace(speed, units) : formatSpeed(speed, units),
      Icon: isPace ? Footprints : Bike,
    })
  }
  if (props.average_heartrate) {
    chips.push({
      label: 'Avg HR',
      value: `${Math.round(props.average_heartrate)} bpm`,
      Icon: Heart,
      colorClass: props.max_heartrate
        ? hrColor(props.average_heartrate, props.max_heartrate)
        : undefined,
      iconClass: 'text-red-500',
    })
  }
  if (props.max_heartrate) {
    chips.push({ label: 'Max HR', value: `${Math.round(props.max_heartrate)} bpm`, Icon: HeartPulse, iconClass: 'text-red-400' })
  }
  if (props.calories) {
    chips.push({ label: 'Calories', value: `${Math.round(props.calories)} kcal`, Icon: Flame, iconClass: 'text-orange-500' })
  }
  if (props.suffer_score) {
    chips.push({ label: 'Suffer Score', value: props.suffer_score.toString(), Icon: Gauge })
  }
  if (props.achievement_count && props.achievement_count > 0) {
    chips.push({ label: 'Achievements', value: props.achievement_count.toString(), Icon: Trophy, iconClass: 'text-yellow-500' })
  }
  if (props.pr_count && props.pr_count > 0) {
    chips.push({ label: 'PRs', value: props.pr_count.toString(), Icon: Medal, iconClass: 'text-yellow-500' })
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className="flex flex-col items-center px-4 py-3 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg min-w-[80px]"
        >
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
            <chip.Icon size={13} className={chip.iconClass} />
            <span className="text-xs">{chip.label}</span>
          </div>
          <span className={`text-lg font-bold text-gray-900 dark:text-white ${chip.colorClass ?? ''}`}>
            {chip.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function GearDistance({ meters }: { meters: number }) {
  const { settings } = useSettings()
  return <>{formatDistance(meters, settings.units)}</>
}
