'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IoMdClose } from 'react-icons/io'
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import type { StravaActivity } from '@/lib/types'
import { useSettings } from '@/lib/settings-context'

export interface Milestone {
  name: string
  threshold: number  // SI units (meters)
  emoji: string
}

interface MilestonePoint {
  date: string
  cumulativeSI: number
  name: string
  emoji: string
}

interface MilestoneModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  headerEmoji: string
  milestones: Milestone[]
  activities: StravaActivity[]
  getValue: (activity: StravaActivity) => number
  formatDisplay: (val: number, imperial: boolean) => string
  formatThreshold: (val: number, imperial: boolean) => string
  formatY: (val: number, imperial: boolean) => string
  emptyIcon?: string
  emptyTitle?: string
  emptyMessage?: string
}

function computeMilestones(
  activities: StravaActivity[],
  milestones: Milestone[],
  getValue: (a: StravaActivity) => number,
): MilestonePoint[] {
  const sorted = [...activities].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )
  const crossed: MilestonePoint[] = []
  let cumulative = 0
  let idx = 0
  for (const activity of sorted) {
    cumulative += getValue(activity)
    while (idx < milestones.length && cumulative >= milestones[idx].threshold) {
      crossed.push({
        date: activity.start_date.slice(0, 10),
        cumulativeSI: cumulative,
        name: milestones[idx].name,
        emoji: milestones[idx].emoji,
      })
      idx++
    }
  }
  return crossed
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props
  if (!payload?.emoji) return null
  return (
    <text x={cx} y={cy - 10} textAnchor="middle" fontSize={16}>
      {payload.emoji}
    </text>
  )
}

const POINT_WIDTH = 80

export function MilestoneModal({
  isOpen,
  onClose,
  title,
  headerEmoji,
  milestones,
  activities,
  getValue,
  formatDisplay,
  formatThreshold,
  formatY,
  emptyIcon = '🏅',
  emptyTitle = 'Keep going!',
  emptyMessage = 'Log some activities to unlock your first milestone.',
}: MilestoneModalProps) {
  const { settings } = useSettings()
  const imperial = settings.units === 'imperial'

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const crossed = computeMilestones(activities, milestones, getValue)
  const crossedNames = new Set(crossed.map((m) => m.name))

  const chartData = crossed.map((m) => ({
    ...m,
    displayVal: Math.round(m.cumulativeSI),
  }))

  const chartWidth = Math.max(500, chartData.length * POINT_WIDTH + 60)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function TooltipContent({ active, payload }: any) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as MilestonePoint
    return (
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg px-3 py-2 text-xs shadow-lg">
        <div className="font-semibold text-gray-900 dark:text-white">
          {d.emoji} {d.name}
        </div>
        <div className="text-gray-500 dark:text-gray-400">{fmtDate(d.date)}</div>
        <div className="text-gray-700 dark:text-gray-300">{formatDisplay(d.cumulativeSI, imperial)}</div>
      </div>
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-white dark:bg-[#161b22] rounded-xl shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#30363d] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{headerEmoji}</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {crossed.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">{emptyIcon}</div>
              <p className="font-medium text-gray-700 dark:text-gray-300">{emptyTitle}</p>
              <p className="text-sm mt-1">{emptyMessage}</p>
            </div>
          ) : (
            <>
              <style>{`
                .ms-chart svg, .ms-chart svg * { outline: none !important; }
                .ms-scroll::-webkit-scrollbar { display: none; }
                .ms-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              `}</style>

              {/* Chart: frozen Y axis + horizontally scrollable plot */}
              <div className="flex ms-chart" style={{ height: 260 }}>
                {/* Frozen Y axis */}
                <div className="shrink-0" style={{ width: 52 }}>
                  <LineChart
                    width={52}
                    height={260}
                    data={chartData}
                    margin={{ top: 36, right: 0, left: 8, bottom: 0 }}
                    style={{ outline: 'none', userSelect: 'none' }}
                  >
                    <YAxis
                      dataKey="displayVal"
                      tickFormatter={(v) => formatY(v, imperial)}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                    />
                    <Line dataKey="displayVal" stroke="transparent" dot={false} />
                  </LineChart>
                </div>

                {/* Scrollable plot */}
                <div className="ms-scroll overflow-x-auto flex-1 min-w-0">
                  <div style={{ width: chartWidth, height: 260 }}>
                    <LineChart
                      width={chartWidth}
                      height={260}
                      data={chartData}
                      margin={{ top: 36, right: 40, left: 40, bottom: 0 }}
                      style={{ outline: 'none', userSelect: 'none' }}
                    >
                      <XAxis
                        dataKey="date"
                        tickFormatter={fmtDate}
                        tick={{ fontSize: 11, fill: 'currentColor' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip content={<TooltipContent />} cursor={false} />
                      <Line
                        type="monotone"
                        dataKey="displayVal"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        dot={<CustomDot />}
                        activeDot={{ r: 4, style: { outline: 'none' } }}
                      />
                    </LineChart>
                  </div>
                </div>
              </div>

              {/* Milestone legend */}
              <div className="mt-4 grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {milestones.map((m) => {
                  const earned = crossedNames.has(m.name)
                  return (
                    <div
                      key={m.name}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                        earned
                          ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5 text-gray-800 dark:text-gray-100'
                          : 'border-gray-200 dark:border-[#30363d] text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      <span className={earned ? '' : 'grayscale opacity-40'}>{m.emoji}</span>
                      <span className="font-medium truncate">{m.name}</span>
                      <span className="ml-auto shrink-0">{formatThreshold(m.threshold, imperial)}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
