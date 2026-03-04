'use client'

import { useSettings } from '@/lib/settings-context'
import { formatDistance } from '@/lib/strava'

interface GearSegment {
  id: string | null
  name: string
  distance: number
  color: string
}

interface Props {
  segments: GearSegment[]
}

export function GearBar({ segments }: Props) {
  const { settings } = useSettings()
  const { units } = settings

  const gearSegments = segments.filter((s) => s.id !== null)
  const gearTotal = gearSegments.reduce((sum, s) => sum + s.distance, 0)

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Gear</h2>

      {gearSegments.length === 0 || gearTotal === 0 ? (
        <>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-[#30363d] mb-3" />
          <p className="text-xs text-gray-500 dark:text-gray-400">No gear recorded</p>
        </>
      ) : (
        <>
          <div className="h-2 rounded-full flex overflow-hidden mb-3">
            {gearSegments.map((seg) => (
              <div
                key={seg.id}
                style={{
                  width: `${(seg.distance / gearTotal) * 100}%`,
                  backgroundColor: seg.color,
                }}
              />
            ))}
          </div>
          <ul className="space-y-1.5">
            {gearSegments.map((seg) => {
              const pct = Math.round((seg.distance / gearTotal) * 100)
              return (
                <li key={seg.id} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                    {seg.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {formatDistance(seg.distance, units)} · {pct}%
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
