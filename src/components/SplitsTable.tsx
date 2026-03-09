'use client'

import type { Split, Lap } from '@/lib/types'
import { useSettings } from '@/lib/settings-context'
import { formatDistance, formatDuration, formatPace, formatSpeed, formatElevation } from '@/lib/strava'

interface SplitsProps {
  splitsMetric?: Split[]
  splitsImperial?: Split[]
  sportType: string
}

interface LapsProps {
  laps: Lap[]
  sportType: string
}

const PACE_SPORTS = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike', 'Swim'])

export function SplitsTable({ splitsMetric, splitsImperial, sportType }: SplitsProps) {
  const { settings } = useSettings()
  const { units } = settings

  const splits = units === 'imperial' && splitsImperial?.length ? splitsImperial : splitsMetric
  if (!splits || splits.length === 0) return null

  const isPace = PACE_SPORTS.has(sportType)

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Splits</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#161b22] text-gray-500 dark:text-gray-400">
              <th className="px-3 py-2 text-left font-medium">#</th>
              <th className="px-3 py-2 text-right font-medium">Dist</th>
              <th className="px-3 py-2 text-right font-medium">Time</th>
              <th className="px-3 py-2 text-right font-medium">{isPace ? 'Pace' : 'Speed'}</th>
              <th className="px-3 py-2 text-right font-medium">Elev Δ</th>
              {splits.some((s) => s.average_heartrate) && (
                <th className="px-3 py-2 text-right font-medium">HR</th>
              )}
            </tr>
          </thead>
          <tbody>
            {splits.map((split) => (
              <tr
                key={split.split}
                className="border-t border-gray-100 dark:border-[#30363d] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors"
              >
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{split.split}</td>
                <td className="px-3 py-2 text-right">{formatDistance(split.distance, units)}</td>
                <td className="px-3 py-2 text-right">{formatDuration(split.moving_time)}</td>
                <td className="px-3 py-2 text-right">
                  {isPace
                    ? formatPace(split.average_speed, units)
                    : formatSpeed(split.average_speed, units)}
                </td>
                <td className="px-3 py-2 text-right">
                  {split.elevation_difference !== 0
                    ? `${split.elevation_difference > 0 ? '+' : ''}${formatElevation(split.elevation_difference, units)}`
                    : '—'}
                </td>
                {splits.some((s) => s.average_heartrate) && (
                  <td className="px-3 py-2 text-right">
                    {split.average_heartrate ? `${Math.round(split.average_heartrate)} bpm` : '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {splits.some((s) => s.average_heartrate) && <SplitHRChart splits={splits} />}
    </div>
  )
}

function SplitHRChart({ splits }: { splits: Split[] }) {
  const hrSplits = splits.filter((s) => s.average_heartrate)
  if (hrSplits.length < 2) return null

  const hrs = hrSplits.map((s) => s.average_heartrate!)
  const minHR = Math.min(...hrs) - 5
  const maxHR = Math.max(...hrs) + 5
  const avg = hrs.reduce((a, b) => a + b, 0) / hrs.length

  const WIDTH = 600
  const HEIGHT = 160
  const PAD = { top: 32, bottom: 36, left: 40, right: 8 }
  const chartW = WIDTH - PAD.left - PAD.right
  const chartH = HEIGHT - PAD.top - PAD.bottom
  const barW = chartW / splits.length
  const gap = barW * 0.2

  const avgY = PAD.top + chartH - ((avg - minHR) / (maxHR - minHR)) * chartH

  return (
    <div className="mt-3 w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto text-gray-500 dark:text-gray-400">
        {/* Chart title */}
        <text x={WIDTH / 2} y={11} textAnchor="middle" fontSize={10} fontWeight="600" fill="currentColor">
          Heart Rate
        </text>

        {/* Y-axis title */}
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fontSize={8}
          fill="currentColor"
          transform={`translate(8, ${PAD.top + chartH / 2}) rotate(-90)`}
        >
          bpm
        </text>

        {/* Y-axis tick labels */}
        <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize={8} fill="currentColor">
          {Math.round(maxHR)}
        </text>
        <text x={PAD.left - 4} y={PAD.top + chartH} textAnchor="end" fontSize={8} fill="currentColor">
          {Math.round(minHR < 0 ? 0 : minHR)}
        </text>

        {/* X-axis title */}
        <text x={PAD.left + chartW / 2} y={HEIGHT - 2} textAnchor="middle" fontSize={8} fill="currentColor">
          Split
        </text>

        {/* Bars */}
        {splits.map((split, i) => {
          const x = PAD.left + i * barW + gap / 2
          const bw = barW - gap
          const hrVal = split.average_heartrate ?? 0
          const barH = hrVal ? ((hrVal - minHR) / (maxHR - minHR)) * chartH : 0
          const y = PAD.top + chartH - barH

          return (
            <g key={split.split}>
              {hrVal > 0 && (
                <>
                  <rect
                    x={x}
                    y={y}
                    width={bw}
                    height={barH}
                    style={{ fill: 'var(--accent)' }}
                    opacity={0.85}
                    rx={2}
                  />
                  <text
                    x={x + bw / 2}
                    y={y - 3}
                    textAnchor="middle"
                    fontSize={8}
                    fill="currentColor"
                  >
                    {Math.round(hrVal)}
                  </text>
                </>
              )}
              <text
                x={x + bw / 2}
                y={PAD.top + chartH + 12}
                textAnchor="middle"
                fontSize={8}
                fill="currentColor"
              >
                {split.split}
              </text>
            </g>
          )
        })}

        {/* Average HR reference line — rendered last to appear on top */}
        <line
          x1={PAD.left}
          y1={avgY}
          x2={WIDTH - PAD.right}
          y2={avgY}
          stroke="var(--accent)"
          strokeOpacity={1}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={WIDTH - PAD.right}
          y={PAD.top - 6}
          textAnchor="end"
          fontSize={8}
          fill="var(--accent)"
        >
          Avg: {Math.round(avg)} bpm
        </text>
      </svg>
    </div>
  )
}

export function LapsTable({ laps, sportType }: LapsProps) {
  const { settings } = useSettings()
  const { units } = settings

  if (!laps || laps.length <= 1) return null

  const isPace = PACE_SPORTS.has(sportType)

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Laps</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#161b22] text-gray-500 dark:text-gray-400">
              <th className="px-3 py-2 text-left font-medium">#</th>
              <th className="px-3 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-right font-medium">Dist</th>
              <th className="px-3 py-2 text-right font-medium">Time</th>
              <th className="px-3 py-2 text-right font-medium">{isPace ? 'Pace' : 'Speed'}</th>
              <th className="px-3 py-2 text-right font-medium">Elev</th>
              {laps.some((l) => l.average_heartrate) && (
                <th className="px-3 py-2 text-right font-medium">HR</th>
              )}
            </tr>
          </thead>
          <tbody>
            {laps.map((lap) => (
              <tr
                key={lap.id}
                className="border-t border-gray-100 dark:border-[#30363d] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#161b22] transition-colors"
              >
                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{lap.lap_index + 1}</td>
                <td className="px-3 py-2 truncate max-w-[120px]">{lap.name}</td>
                <td className="px-3 py-2 text-right">{formatDistance(lap.distance, units)}</td>
                <td className="px-3 py-2 text-right">{formatDuration(lap.moving_time)}</td>
                <td className="px-3 py-2 text-right">
                  {isPace
                    ? formatPace(lap.average_speed, units)
                    : formatSpeed(lap.average_speed, units)}
                </td>
                <td className="px-3 py-2 text-right">
                  {lap.total_elevation_gain > 0
                    ? formatElevation(lap.total_elevation_gain, units)
                    : '—'}
                </td>
                {laps.some((l) => l.average_heartrate) && (
                  <td className="px-3 py-2 text-right">
                    {lap.average_heartrate ? `${Math.round(lap.average_heartrate)} bpm` : '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
