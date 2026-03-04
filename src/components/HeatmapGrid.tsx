'use client'

import { useMemo } from 'react'
import type { StravaActivity } from '@/lib/types'
import { useSettings } from '@/lib/settings-context'

interface Props {
  activities: StravaActivity[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// All classes must be spelled out in full for Tailwind JIT to include them
const COLOR_SCHEMES = {
  orange: [
    'heatmap-0',
    'heatmap-1',
    'heatmap-2',
    'heatmap-3',
    'heatmap-4',
  ],
  green: [
    'bg-[#ebedf0] dark:bg-[#161b22]',
    'bg-[#9be9a8] dark:bg-[#0e4429]',
    'bg-[#40c463] dark:bg-[#006d32]',
    'bg-[#30a14e] dark:bg-[#26a641]',
    'bg-[#216e39] dark:bg-[#39d353]',
  ],
  blue: [
    'bg-[#ebedf0] dark:bg-[#161b22]',
    'bg-[#bae6fd] dark:bg-[#0c2a4a]',
    'bg-[#38bdf8] dark:bg-[#075985]',
    'bg-[#0284c7] dark:bg-[#0284c7]',
    'bg-[#0c4a6e] dark:bg-[#38bdf8]',
  ],
}

function getIntensity(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}

interface DayCell {
  date: Date | null
  count: number
  dateStr: string
}

export function HeatmapGrid({ activities }: Props) {
  const { settings } = useSettings()
  const colorClasses = COLOR_SCHEMES[settings.heatmapColor]

  const { weeks, monthLabels } = useMemo(() => {
    const countByDate: Record<string, number> = {}
    for (const activity of activities) {
      const date = activity.start_date_local.split('T')[0]
      countByDate[date] = (countByDate[date] || 0) + 1
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
          week.push({ date: null, count: 0, dateStr: '' })
        } else {
          const dateStr = date.toISOString().split('T')[0]
          week.push({ date, count: countByDate[dateStr] || 0, dateStr })

          // Track month label changes (only label at first day of month)
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
          {monthLabels.map(({ weekIndex, label }) => (
            <div
              key={`${weekIndex}-${label}`}
              className="text-xs text-gray-500 dark:text-gray-400 absolute"
              style={{ marginLeft: `${weekIndex * 14}px` }}
            >
              {label}
            </div>
          ))}
          {/* Spacer to give month labels room */}
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
                  title={
                    day.date
                      ? `${day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`
                      : ''
                  }
                  className={`w-[11px] h-[11px] rounded-sm transition-opacity ${
                    day.date ? colorClasses[getIntensity(day.count)] : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 justify-end text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          {[0, 1, 3, 5, 7].map((v) => (
            <div key={v} className={`w-[11px] h-[11px] rounded-sm ${colorClasses[getIntensity(v)]}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
