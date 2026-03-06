'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IoMdClose } from 'react-icons/io'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import type { StravaActivity } from '@/lib/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

interface Figure {
  name: string
  race: string
  threshold: number
  label: string
  emoji: string
}

const MARATHON_FIGURES: Figure[] = [
  { name: 'Kelvin Kiptum', race: '2023 Chicago Marathon', threshold: 7235, label: '2:00:35', emoji: '⚡' },
  { name: 'Eliud Kipchoge', race: '2022 Berlin Marathon', threshold: 7269, label: '2:01:09', emoji: '🥇' },
  { name: 'Gordon Ramsay', race: '2004 London Marathon', threshold: 12637, label: '3:30:37', emoji: '🔥' },
  { name: 'Edward Norton', race: '2009 New York City Marathon', threshold: 13681, label: '3:48:01', emoji: '🎞️' },
  { name: 'Ryan Reynolds', race: '2008 New York City Marathon', threshold: 13822, label: '3:50:22', emoji: '🦸' },
  { name: 'Will Ferrell', race: '2003 Boston Marathon', threshold: 14172, label: '3:56:12', emoji: '🏃' },
  { name: 'Bobby Flay', race: '2010 New York City Marathon', threshold: 14497, label: '4:01:37', emoji: '👨‍🍳' },
  { name: 'Kevin Hart', race: '2017 New York City Marathon', threshold: 14706, label: '4:05:06', emoji: '😂' },
  { name: 'Ethan Hawke', race: '2015 New York City Marathon', threshold: 15930, label: '4:25:30', emoji: '🎥' },
  { name: 'Oprah Winfrey', race: '1994 Marine Corps Marathon', threshold: 16160, label: '4:29:20', emoji: '🎤' },
  { name: 'Teri Hatcher', race: '2014 New York City Marathon', threshold: 18402, label: '5:06:42', emoji: '📺' },
  { name: 'Katie Holmes', race: '2007 New York City Marathon', threshold: 19798, label: '5:29:58', emoji: '🎭' },
  { name: 'Freddie Prinze Jr.', race: '2006 Los Angeles Marathon', threshold: 21049, label: '5:50:49', emoji: '🎬' },
  { name: 'Alicia Keys', race: '2015 New York City Marathon', threshold: 21052, label: '5:50:52', emoji: '🎹' },
  { name: 'Al Roker', race: '2010 New York City Marathon', threshold: 25784, label: '7:09:44', emoji: '☀️' },
]

// Acceptable marathon distance range: 26.2 miles ± 0.6 miles (to account for GPS inaccuracies and slight course variations)
const MARATHON_MIN_M = 42165 // 26.2 miles
const MARATHON_MAX_M = 43126 // 26.8 miles

type BarEntry = {
  id: string
  label: string
  time: number
  isUser: boolean
  sublabel: string
}

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface TooltipPayload {
  payload?: BarEntry
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length || !payload[0].payload) return null
  const entry = payload[0].payload
  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg p-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-900 dark:text-white">{fmtTime(entry.time)}</p>
      <p className="text-gray-500 dark:text-gray-400">{entry.sublabel}</p>
    </div>
  )
}

export function MarathonCompareModal({ isOpen, onClose, activities }: Props) {
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

  const userRuns = activities.filter(
    (a) => a.distance >= MARATHON_MIN_M && a.distance <= MARATHON_MAX_M
  )

  const userEntries: BarEntry[] = userRuns.map((a) => ({
    id: `user-${a.id}`,
    label: `🏃 YOU (${a.name})`,
    time: a.elapsed_time,
    isUser: true,
    sublabel: formatDate(a.start_date_local),
  }))

  const figureEntries: BarEntry[] = MARATHON_FIGURES.map((f) => ({
    id: `figure-${f.name}`,
    label: `${f.emoji} ${f.name}`,
    time: f.threshold,
    isUser: false,
    sublabel: f.label,
  }))

  const entries: BarEntry[] = [...userEntries, ...figureEntries].sort((a, b) => a.time - b.time)

  const BAR_SIZE = 20
  const Y_AXIS_WIDTH = 200
  const CHART_WIDTH = 580
  const SCROLL_HEIGHT = 380
  const X_AXIS_HEIGHT = 40
  const scrollChartHeight = Math.max(SCROLL_HEIGHT, entries.length * (BAR_SIZE + 10) + 20)
  const maxTime = entries.length > 0 ? Math.max(...entries.map((e) => e.time)) : 20000
  const domain: [number, number] = [0, maxTime]

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-white dark:bg-[#161b22] rounded-xl shadow-xl flex flex-col transition-all duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#30363d] flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🏅 Where do I rank?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {userRuns.length === 0 && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] text-xs text-gray-500 dark:text-gray-400">
              <span>🏁</span>
              <span>Complete a marathon (26.2 mi) and your time will appear on this chart.</span>
            </div>
          )}

          <div className="mc-chart overflow-x-auto">
            <style>{`
              .mc-chart svg, .mc-chart svg * { outline: none !important; }
              .mc-scroll::-webkit-scrollbar { display: none; }
              .mc-scroll { scrollbar-width: none; -ms-overflow-style: none; }
            `}</style>

            {/* Scrollable bars + Y-labels */}
            <div className="mc-scroll overflow-y-auto" style={{ height: SCROLL_HEIGHT }}>
              <BarChart
                layout="vertical"
                data={entries}
                width={CHART_WIDTH}
                height={scrollChartHeight}
                barSize={BAR_SIZE}
                margin={{ top: 8, right: 40, left: 8, bottom: 0 }}
                style={{ outline: 'none', userSelect: 'none' }}
              >
                <XAxis type="number" domain={domain} hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={Y_AXIS_WIDTH}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Bar dataKey="time" radius={[0, 4, 4, 0]}>
                  {entries.map((e) => (
                    <Cell key={e.id} fill={e.isUser ? 'var(--accent)' : '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </div>

            {/* Frozen X-axis */}
            <BarChart
              layout="vertical"
              data={entries}
              width={CHART_WIDTH}
              height={X_AXIS_HEIGHT}
              barSize={BAR_SIZE}
              margin={{ top: 0, right: 40, left: 8, bottom: 8 }}
              style={{ outline: 'none', userSelect: 'none' }}
            >
              <XAxis
                type="number"
                domain={domain}
                tickFormatter={fmtTime}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis type="category" dataKey="label" width={Y_AXIS_WIDTH} hide />
              <Bar dataKey="time" fill="transparent" stroke="none" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
