import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionWithRefresh } from '@/lib/auth'
import {
  fetchAthlete,
  fetchAllActivities,
  getSportIcon,
  getSportLabel,
} from '@/lib/strava'
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { StatsBar } from '@/components/StatsBar'
import { ActivityFeed } from '@/components/ActivityFeed'
import { SportBests } from '@/components/SportBests'
import { GearBar } from '@/components/GearBar'
import { FaRunning } from 'react-icons/fa'

interface Props {
  params: { sport_type: string }
}

export default async function SportDetailPage({ params }: Props) {
  const session = await getSessionWithRefresh()

  if (!session?.access_token) {
    redirect('/')
  }

  const sportType = decodeURIComponent(params.sport_type)

  const athlete = await fetchAthlete(session.access_token)
  const createdYear = athlete.created_at
    ? new Date(athlete.created_at).getFullYear()
    : new Date().getFullYear()
  const allActivities = await fetchAllActivities(session.access_token)

  const activities = allActivities.filter((a) => a.sport_type === sportType)

  if (activities.length === 0) {
    redirect('/dashboard')
  }

  // Aggregate stats
  const totalDistance = activities.reduce((s, a) => s + a.distance, 0)
  const totalElevation = activities.reduce((s, a) => s + a.total_elevation_gain, 0)
  const totalKudos = activities.reduce((s, a) => s + (a.kudos_count || 0), 0)

  // PRs / Bests
  const withDistance = activities.filter((a) => a.distance > 0)
  const withSpeed = activities.filter((a) => a.average_speed > 0)
  const withElevation = activities.filter((a) => a.total_elevation_gain > 0)

  const longestActivity = withDistance.length
    ? withDistance.reduce((best, a) => (a.distance > best.distance ? a : best), withDistance[0])
    : null

  const fastestActivity = withSpeed.length
    ? withSpeed.reduce((best, a) => (a.average_speed > best.average_speed ? a : best), withSpeed[0])
    : null

  const mostElevationActivity = withElevation.length
    ? withElevation.reduce((best, a) => (a.total_elevation_gain > best.total_elevation_gain ? a : best), withElevation[0])
    : null

  const isPaceSport = ['Run', 'TrailRun', 'Walk', 'Hike', 'VirtualRun'].includes(sportType)

  // Gear breakdown
  const gearLookup = new Map<string, string>()
  for (const g of [...(athlete.bikes ?? []), ...(athlete.shoes ?? [])]) {
    gearLookup.set(g.id, g.name)
  }

  const gearDistMap = new Map<string | null, number>()
  for (const a of activities) {
    const key = a.gear_id ?? null
    gearDistMap.set(key, (gearDistMap.get(key) ?? 0) + a.distance)
  }

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899']
  const gearSegments = Array.from(gearDistMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, distance], i) => ({
      id,
      name: id ? (gearLookup.get(id) ?? 'Unknown gear') : 'No gear',
      distance,
      color: id ? COLORS[i % COLORS.length] : '#6b7280',
    }))

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* Top nav */}
      <header className="border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaRunning size={24} className="text-[var(--accent)]" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Fitness Repo
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm mb-6">
          <Link
            href="/dashboard"
            className="text-[var(--accent)] hover:underline font-medium"
          >
            {athlete.firstname} {athlete.lastname}
          </Link>
          <span className="text-gray-400 dark:text-gray-600 mx-1">/</span>
          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>{getSportIcon(sportType)}</span>
            {getSportLabel(sportType)}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            {/* Stats */}
            <StatsBar
              activities={activities}
              sportMode
              totalDistance={totalDistance}
              totalElevation={totalElevation}
            />

            {/* Heatmap */}
            <div className="mt-6 p-4 border border-gray-200 dark:border-[#30363d] rounded-lg">
              <HeatmapGrid activities={activities} createdYear={createdYear} />
            </div>

            {/* PRs / Bests */}
            <SportBests
              longestActivity={longestActivity}
              fastestActivity={fastestActivity}
              mostElevationActivity={mostElevationActivity}
              isPaceSport={isPaceSport}
            />

            {/* Full activity feed */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                All {getSportLabel(sportType).toLowerCase()} activities
              </h2>
              <ActivityFeed activities={activities} />
            </div>
          </main>

          <aside className="lg:w-64 flex-shrink-0">
            <GearBar segments={gearSegments} />
          </aside>
        </div>
      </div>
    </div>
  )
}
