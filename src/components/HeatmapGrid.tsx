'use client'

import { useMemo, useState } from 'react'
import type { StravaActivity } from '@/lib/types'

interface Props {
  activities: StravaActivity[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getColorClass(seconds: number): string {
  if (seconds === 0)     return 'heatmap-0'
  if (seconds <= 1800)   return 'heatmap-1'   // ≤ 30 min
  if (seconds <= 3600)   return 'heatmap-2'   // ≤ 60 min
  if (seconds <= 5400)   return 'heatmap-3'   // ≤ 90 min
  return 'heatmap-4'                          // > 90 min
}

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

interface DayCell {
  date: Date | null
  seconds: number
  dateStr: string
}

interface Tooltip {
  text: string
  x: number  // viewport x
  y: number  // viewport y (top of cell)
}

export function HeatmapGrid({ activities }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  const { weeks, monthLabels } = useMemo(() => {
    const secondsByDate: Record<string, number> = {}
    for (const activity of activities) {
      const date = activity.start_date_local.split('T')[0]
      secondsByDate[date] = (secondsByDate[date] || 0) + activity.moving_time
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Start from the Sunday of ~52 weeks ago
    const start = new Date(today)
    start.setDate(start.getDate() - 364)
    start.setDate(start.getDate() - start.getDay()) // go to Sunday

    const weeks: DayCell[][] = []
    const monthLabels: { weekIndex: number; label: string }[] = []
    let lastMonth = -1

    for (let w = 0; w < 53; w++) {
      const week: DayCell[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(start)
        date.setDate(start.getDate() + w * 7 + d)

        if (date > today) {
          week.push({ date: null, seconds: 0, dateStr: '' })
        } else {
          const dateStr = date.toISOString().split('T')[0]
          week.push({ date, seconds: secondsByDate[dateStr] || 0, dateStr })

          if (d === 0) {
            const month = date.getMonth()
            if (month !== lastMonth) {
              monthLabels.push({ weekIndex: w, label: MONTHS[month] })
              lastMonth = month
            }
          }
        }
      }
      weeks.push(week)
    }

    return { weeks, monthLabels }
  }, [activities])

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          <div style={{ height: '16px', width: `${53 * 14}px` }} className="relative overflow-hidden">
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${weekIndex}-${label}`}
                className="text-xs text-gray-500 dark:text-gray-400 absolute"
                style={{ left: `${weekIndex * 14}px` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAYS.map((day, i) => (
              <div
                key={day}
                className="w-6 h-[11px] text-[10px] text-gray-500 dark:text-gray-400 leading-none flex items-center"
              >
                {i % 2 === 1 ? day.slice(0, 3) : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-[11px] h-[11px] rounded-sm transition-opacity ${
                    day.date ? getColorClass(day.seconds) : 'opacity-0'
                  }`}
                  onMouseEnter={day.date ? (e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect()
                    const dateLabel = day.date!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    const text = day.seconds > 0
                      ? `${fmtDuration(day.seconds)} active time on ${dateLabel}`
                      : `No activity on ${dateLabel}`
                    setTooltip({
                      text,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    })
                  } : undefined}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 justify-end text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          {[0, 900, 2700, 4500, 6000].map((v) => (
            <div key={v} className={`w-[11px] h-[11px] rounded-sm ${getColorClass(v)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full px-2 py-1 rounded text-xs text-white bg-gray-900 dark:bg-gray-700 whitespace-nowrap shadow"
          style={{ left: tooltip.x, top: tooltip.y - 4 }}
        >
          {tooltip.text}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  )
}
