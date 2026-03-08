'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { StravaActivity } from '@/lib/types'
import { useDemoMode } from './DemoModeProvider'
import {
  formatDistance,
  formatDuration,
  formatDate,
  getSportLabel,
} from '@/lib/strava'
import { ActivityBadge } from './ActivityBadge'
import { SportIcon } from './SportIcon'
import { useSettings } from '@/lib/settings-context'
import { Star, GitFork, Camera, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

const SPORT_COLORS: Record<string, string> = {
  Run: 'border-blue-300   bg-blue-50   text-blue-700   dark:border-blue-700   dark:bg-blue-950/40   dark:text-blue-300',
  TrailRun: 'border-blue-400   bg-blue-50   text-blue-800   dark:border-blue-600   dark:bg-blue-950/40   dark:text-blue-300',
  Ride: 'border-green-300  bg-green-50  text-green-700  dark:border-green-700  dark:bg-green-950/40  dark:text-green-300',
  MountainBikeRide: 'border-green-400  bg-green-50  text-green-800  dark:border-green-600  dark:bg-green-950/40  dark:text-green-300',
  GravelRide: 'border-lime-300   bg-lime-50   text-lime-700   dark:border-lime-700   dark:bg-lime-950/40   dark:text-lime-300',
  VirtualRide: 'border-teal-300   bg-teal-50   text-teal-700   dark:border-teal-700   dark:bg-teal-950/40   dark:text-teal-300',
  Swim: 'border-cyan-300   bg-cyan-50   text-cyan-700   dark:border-cyan-700   dark:bg-cyan-950/40   dark:text-cyan-300',
  Walk: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300',
  Hike: 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  WeightTraining: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  Workout: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  Yoga: 'border-pink-300   bg-pink-50   text-pink-700   dark:border-pink-700   dark:bg-pink-950/40   dark:text-pink-300',
  Crossfit: 'border-red-300    bg-red-50    text-red-700    dark:border-red-700    dark:bg-red-950/40    dark:text-red-300',
  Soccer: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  Tennis: 'border-lime-300   bg-lime-50   text-lime-700   dark:border-lime-700   dark:bg-lime-950/40   dark:text-lime-300',
  Skiing: 'border-sky-300    bg-sky-50    text-sky-700    dark:border-sky-700    dark:bg-sky-950/40    dark:text-sky-300',
  NordicSki: 'border-sky-300    bg-sky-50    text-sky-700    dark:border-sky-700    dark:bg-sky-950/40    dark:text-sky-300',
  Snowboard: 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  Kayaking: 'border-teal-300   bg-teal-50   text-teal-700   dark:border-teal-700   dark:bg-teal-950/40   dark:text-teal-300',
  Rowing: 'border-cyan-300   bg-cyan-50   text-cyan-700   dark:border-cyan-700   dark:bg-cyan-950/40   dark:text-cyan-300',
}

const DEFAULT_SPORT_COLOR = 'border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800/40 dark:text-gray-400'

function SportLabel({ sport }: { sport: string }) {
  const colors = SPORT_COLORS[sport] ?? DEFAULT_SPORT_COLOR
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs font-medium leading-none ${colors}`}>
      {getSportLabel(sport)}
    </span>
  )
}

interface Props {
  activities: StravaActivity[]
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export function ActivityFeed({ activities }: Props) {
  const { settings } = useSettings()
  const { isDemo, showDemoModal } = useDemoMode()
  const [page, setPage] = useState(1)
  const [jumpValue, setJumpValue] = useState('')

  const totalPages = Math.ceil(activities.length / PAGE_SIZE)

  function jumpToPage() {
    const n = parseInt(jumpValue, 10)
    if (!isNaN(n)) setPage(Math.min(totalPages, Math.max(1, n)))
    setJumpValue('')
  }
  const shown = activities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (shown.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm py-4">
        No activities found.
      </p>
    )
  }

  return (
    <div>
      <ol className="border border-gray-200 dark:border-[#30363d] rounded-lg divide-y divide-gray-200 dark:divide-[#30363d] overflow-hidden">
        {shown.map((activity) => (
          <li key={activity.id} className="hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors">
            <Link href={`/dashboard/activity/${activity.id}`} onClick={isDemo ? (e) => { e.preventDefault(); showDemoModal() } : undefined} className="flex items-start gap-3 px-4 py-3 w-full">
              {/* Sport icon */}
              <div className="flex-shrink-0 mt-0.5 text-gray-500 dark:text-gray-400">
                <SportIcon sport={activity.sport_type} size={18} />
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-[#e6edf3] text-sm truncate">
                    {activity.name}
                  </span>
                  <SportLabel sport={activity.sport_type} />
                  <ActivityBadge visibility={activity.visibility} />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-[#8b949e]">
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
                  {(activity.total_photo_count ?? 0) > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1" title="Photos">
                        <Camera size={12} />
                        {activity.total_photo_count}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right-side meta */}
              <div className="flex-shrink-0 flex flex-col items-end gap-1 text-xs text-gray-500 dark:text-[#8b949e]">
                {activity.kudos_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500" />
                    {activity.kudos_count}
                  </span>
                )}
                {activity.athlete_count > 1 && (
                  <span className="flex items-center gap-1" title="Workout partners">
                    <GitFork size={12} />
                    {activity.athlete_count - 1}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#161b22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="px-2 py-1 text-sm text-gray-400 dark:text-gray-500 select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-sm rounded border transition-colors ${p === page
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white font-medium'
                  : 'border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#161b22]'
                  }`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#161b22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>

          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-[#30363d]">
            <span className="text-xs text-gray-400 dark:text-gray-500">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') jumpToPage() }}
              onBlur={jumpToPage}
              placeholder={String(page)}
              className="w-12 px-1.5 py-1 text-sm text-center rounded border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[var(--accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
