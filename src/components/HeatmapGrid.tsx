'use client'

import { useMemo, useState } from 'react'
import type { StravaActivity } from '@/lib/types'

interface Props {
  activities: StravaActivity[]
  createdYear?: number
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
  x: number
  y: number
}

export function HeatmapGrid({ activities, createdYear }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const currentYear = today.getFullYear()
  const minYear = createdYear ?? currentYear
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const years = useMemo(() => {
    const result: number[] = []
    for (let y = currentYear; y >= minYear; y--) result.push(y)
    return result
  }, [minYear, currentYear])

  const { weeks, monthLabels, yearActivityCount } = useMemo(() => {
    const secondsByDate: Record<string, number> = {}
    let yearActivityCount = 0
    for (const activity of activities) {
      const date = activity.start_date_local.split('T')[0]
      secondsByDate[date] = (secondsByDate[date] || 0) + activity.moving_time
      if (parseInt(date.split('-')[0]) === selectedYear) yearActivityCount++
    }

    // Start from the Sunday of or before Jan 1
    const jan1 = new Date(selectedYear, 0, 1)
    const start = new Date(jan1)
    start.setDate(start.getDate() - start.getDay())

    const weeks: DayCell[][] = []
    for (let w = 0; w < 54; w++) {
      const week: DayCell[] = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(start)
        date.setDate(start.getDate() + w * 7 + d)

        const inYear = date.getFullYear() === selectedYear

        if (!inYear) {
          week.push({ date: null, seconds: 0, dateStr: '' })
        } else {
          const dateStr = date.toISOString().split('T')[0]
          week.push({ date, seconds: secondsByDate[dateStr] || 0, dateStr })
        }
      }
      // Stop once we've passed Dec 31 (all cells null)
      if (week.every((c) => c.date === null)) break
      weeks.push(week)
    }

    // Build month labels at the first week each month appears
    const monthLabels: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    for (let w = 0; w < weeks.length; w++) {
      for (const cell of weeks[w]) {
        if (cell.date) {
          const month = cell.date.getMonth()
          if (month !== lastMonth) {
            monthLabels.push({ weekIndex: w, label: MONTHS[month] })
            lastMonth = month
          }
          break
        }
      }
    }

    return { weeks, monthLabels, yearActivityCount }
  }, [activities, selectedYear, currentYear, today])

  return (
    <div className="flex gap-4 items-start">
      <div className="overflow-x-auto flex-1">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            <div style={{ height: '16px', width: `${weeks.length * 14}px` }} className="relative overflow-hidden">
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
                    onMouseEnter={day.date && day.date <= today ? (e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect()
                      const dateLabel = day.date!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      const text = day.seconds > 0
                        ? `${fmtDuration(day.seconds)} active time on ${dateLabel}`
                        : `No activity on ${dateLabel}`
                      setTooltip({ text, x: rect.left + rect.width / 2, y: rect.top })
                    } : undefined}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend + count */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {yearActivityCount} activit{yearActivityCount === 1 ? 'y' : 'ies'} in {selectedYear}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Less</span>
              {[0, 900, 2700, 4500, 6000].map((v) => (
                <div key={v} className={`w-[11px] h-[11px] rounded-sm ${getColorClass(v)}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
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

      {/* Year selector */}
      {years.length > 1 && (
        <div className="flex flex-col shrink-0">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-2 py-0.5 text-xs rounded text-right transition-colors ${
                year === selectedYear
                  ? 'text-[var(--accent)] font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
