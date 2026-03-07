'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Award, Flag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import type { StravaActivity } from '@/lib/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

interface Figure {
  name: string
  raceName: string
  threshold: number
  label: string
}

const MARATHON_FIGURES: Figure[] = [
  { name: 'Al Roker',           raceName: '2010 New York City Marathon',  threshold: 25784, label: '7:09:44' },
  { name: 'Alicia Keys',        raceName: '2015 New York City Marathon',  threshold: 21052, label: '5:50:52' },
  { name: 'Freddie Prinze Jr.', raceName: '2006 Los Angeles Marathon',    threshold: 21049, label: '5:50:49' },
  { name: 'Katie Holmes',       raceName: '2007 New York City Marathon',  threshold: 19798, label: '5:29:58' },
  { name: 'Teri Hatcher',       raceName: '2014 New York City Marathon',  threshold: 18402, label: '5:06:42' },
  { name: 'Oprah Winfrey',      raceName: '1994 Marine Corps Marathon',   threshold: 16160, label: '4:29:20' },
  { name: 'Ethan Hawke',        raceName: '2015 New York City Marathon',  threshold: 15930, label: '4:25:30' },
  { name: 'Kevin Hart',         raceName: '2017 New York City Marathon',  threshold: 14706, label: '4:05:06' },
  { name: 'Bobby Flay',         raceName: '2010 New York City Marathon',  threshold: 14497, label: '4:01:37' },
  { name: 'Will Ferrell',       raceName: '2003 Boston Marathon',         threshold: 14172, label: '3:56:12' },
  { name: 'Ryan Reynolds',      raceName: '2008 New York City Marathon',  threshold: 13822, label: '3:50:22' },
  { name: 'Edward Norton',      raceName: '2009 New York City Marathon',  threshold: 13681, label: '3:48:01' },
  { name: 'Gordon Ramsay',      raceName: '2004 London Marathon',         threshold: 12637, label: '3:30:37' },
  { name: 'Eliud Kipchoge',     raceName: '2022 Berlin Marathon',         threshold: 7269,  label: '2:01:09' },
  { name: 'Kelvin Kiptum',      raceName: '2023 Chicago Marathon',        threshold: 7235,  label: '2:00:35' },
]

const MARATHON_MIN_M = 42165 // 26.2 miles
const MARATHON_MAX_M = 43126 // 26.8 miles

type BarEntry = {
  id: string
  label: string
  time: number
  isUser: boolean
  sublabel: string
  raceName?: string
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
      {entry.raceName && (
        <p className="text-gray-500 dark:text-gray-400">{entry.raceName}</p>
      )}
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
    label: `YOU (${a.name})`,
    time: a.elapsed_time,
    isUser: true,
    sublabel: formatDate(a.start_date_local),
  }))

  const figureEntries: BarEntry[] = MARATHON_FIGURES.map((f) => ({
    id: `figure-${f.name}`,
    label: f.name,
    time: f.threshold,
    isUser: false,
    sublabel: f.label,
    raceName: f.raceName,
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
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Where do I rank?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {userRuns.length === 0 && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] text-xs text-gray-500 dark:text-gray-400">
              <Flag size={13} className="flex-shrink-0" />
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
                    <Cell key={e.id} fill="var(--accent)" />
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
              margin={{ top: 0, right: 40, left: Y_AXIS_WIDTH + 8, bottom: 8 }}
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
              <Bar dataKey="time" fill="transparent" stroke="none" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
