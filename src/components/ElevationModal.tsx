'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IoMdClose } from 'react-icons/io'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { StravaActivity } from '@/lib/types'
import { useSettings } from '@/lib/settings-context'

interface ElevationModalProps {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

const MILESTONES = [
  { name: 'Statue of Liberty', heightM: 93, emoji: '🗽' },
  { name: 'Eiffel Tower', heightM: 330, emoji: '🗼' },
  { name: 'Empire State Building', heightM: 443, emoji: '🏙️' },
  { name: 'Burj Khalifa', heightM: 828, emoji: '🏗️' },
  { name: 'Table Mountain', heightM: 1085, emoji: '⛰️' },
  { name: 'Ben Nevis', heightM: 1345, emoji: '🏴' },
  { name: 'Mount Fuji', heightM: 3776, emoji: '🗻' },
  { name: 'Matterhorn', heightM: 4478, emoji: '⛰️' },
  { name: 'Mont Blanc', heightM: 4808, emoji: '🏔️' },
  { name: 'Kilimanjaro', heightM: 5895, emoji: '🌍' },
  { name: 'Aconcagua', heightM: 6961, emoji: '🌎' },
  { name: 'K2', heightM: 8611, emoji: '🏔️' },
  { name: 'Mount Everest', heightM: 8849, emoji: '🏔️' },
  { name: 'Commercial Jet Altitude', heightM: 11000, emoji: '✈️' },
  { name: 'Weather Balloon', heightM: 30000, emoji: '🎈' },
  { name: "Baumgartner's Jump", heightM: 38969, emoji: '🪂' },
  { name: 'Stratosphere', heightM: 50000, emoji: '🌡️' },
  { name: 'Mesosphere', heightM: 80000, emoji: '🌌' },
  { name: 'Kármán Line (Edge of Space)', heightM: 100000, emoji: '🚀' },
  { name: 'Low Earth Orbit', heightM: 200000, emoji: '🛰️' },
  { name: 'International Space Station', heightM: 408000, emoji: '🧑‍🚀' },
  { name: 'Hubble Space Telescope', heightM: 540000, emoji: '🔭' },
  { name: 'Geostationary Orbit', heightM: 35786000, emoji: '📡' },
  { name: 'Halfway to the Moon', heightM: 192200000, emoji: '🌗' },
  { name: 'The Moon', heightM: 384400000, emoji: '🌕' },
  { name: 'One Lunar Round Trip', heightM: 768800000, emoji: '🚀🌕🚀' },
]

interface MilestonePoint {
  date: string
  cumulativeM: number
  name: string
  emoji: string
}

function computeElevationMilestones(activities: StravaActivity[]): MilestonePoint[] {
  const sorted = [...activities].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )

  const crossed: MilestonePoint[] = []
  let cumulative = 0
  let milestoneIdx = 0

  for (const activity of sorted) {
    cumulative += activity.total_elevation_gain
    while (milestoneIdx < MILESTONES.length && cumulative >= MILESTONES[milestoneIdx].heightM) {
      crossed.push({
        date: activity.start_date.slice(0, 10),
        cumulativeM: cumulative,
        name: MILESTONES[milestoneIdx].name,
        emoji: MILESTONES[milestoneIdx].emoji,
      })
      milestoneIdx++
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, imperial }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as MilestonePoint
  const displayVal = imperial
    ? `${Math.round(d.cumulativeM * 3.28084).toLocaleString()} ft`
    : `${Math.round(d.cumulativeM).toLocaleString()} m`
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-gray-900 dark:text-white">
        {d.emoji} {d.name}
      </div>
      <div className="text-gray-500 dark:text-gray-400">{fmtDate(d.date)}</div>
      <div className="text-gray-700 dark:text-gray-300">{displayVal}</div>
    </div>
  )
}

const POINT_WIDTH = 80

export function ElevationModal({ isOpen, onClose, activities }: ElevationModalProps) {
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

  const milestones = computeElevationMilestones(activities)
  const crossedNames = new Set(milestones.map((m) => m.name))

  const chartData = milestones.map((m) => ({
    ...m,
    displayVal: imperial ? Math.round(m.cumulativeM * 3.28084) : Math.round(m.cumulativeM),
  }))

  function fmtY(val: number) {
    if (imperial) return `${(val / 5280).toFixed(1)}mi`
    return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`
  }

  const chartWidth = Math.max(500, chartData.length * POINT_WIDTH + 60)

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
            <span className="text-lg">⛰️</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Elevation Journey</h2>
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
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">🧗</div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Keep climbing!</p>
              <p className="text-sm mt-1">Log some elevation to unlock your first milestone.</p>
            </div>
          ) : (
            <>
              <style>{`
                .elev-chart svg, .elev-chart svg * { outline: none !important; }
                .elev-scroll::-webkit-scrollbar { display: none; }
                .elev-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              `}</style>

              {/* Chart: frozen Y axis + horizontally scrollable plot */}
              <div className="flex elev-chart" style={{ height: 260 }}>
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
                      tickFormatter={fmtY}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                    />
                    <Line dataKey="displayVal" stroke="transparent" dot={false} />
                  </LineChart>
                </div>

                {/* Scrollable plot (Y axis hidden) */}
                <div className="elev-scroll overflow-x-auto flex-1 min-w-0">
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
                      <Tooltip
                        content={<CustomTooltip imperial={imperial} />}
                        cursor={false}
                      />
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
                {MILESTONES.map((m) => {
                  const earned = crossedNames.has(m.name)
                  const displayHeight = imperial
                    ? `${Math.round(m.heightM * 3.28084).toLocaleString()} ft`
                    : `${m.heightM.toLocaleString()} m`
                  return (
                    <div
                      key={m.name}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${earned
                        ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5 text-gray-800 dark:text-gray-100'
                        : 'border-gray-200 dark:border-[#30363d] text-gray-400 dark:text-gray-600'
                        }`}
                    >
                      <span className={earned ? '' : 'grayscale opacity-40'}>{m.emoji}</span>
                      <span className="font-medium truncate">{m.name}</span>
                      <span className="ml-auto shrink-0">{displayHeight}</span>
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
