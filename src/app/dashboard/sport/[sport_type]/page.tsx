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
  const createdAt = athlete.created_at
    ? Math.floor(new Date(athlete.created_at).getTime() / 1000)
    : 0
  const createdYear = athlete.created_at
    ? new Date(athlete.created_at).getFullYear()
    : new Date().getFullYear()
  const allActivities = await fetchAllActivities(session.access_token, createdAt)

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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* Top nav */}
      <header className="border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-[var(--accent)]"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.172" />
            </svg>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Strava Dashboard
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
          <ActivityFeed activities={activities} limit={Infinity} />
        </div>
      </div>
    </div>
  )
}
