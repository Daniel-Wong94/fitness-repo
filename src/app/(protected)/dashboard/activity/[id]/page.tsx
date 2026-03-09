import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import polyline from '@mapbox/polyline'
import { getSessionWithRefresh } from '@/lib/auth'
import { fetchActivity, fetchActivityComments, fetchAthlete, fetchActivityPhotos } from '@/lib/strava'
import {
  formatDistance,
  formatDate,
  getSportLabel,
} from '@/lib/strava'
import { ActivityBadge } from '@/components/ActivityBadge'
import { SplitsTable, LapsTable } from '@/components/SplitsTable'
import { WeatherCard } from '@/components/WeatherCard'
import { ActivityStatsChips, GearDistance } from '@/components/ActivityStatsChips'
import { SportIcon } from '@/components/SportIcon'
import { ActivityPageTracker } from '@/components/ActivityPageTracker'
import { Users2, Bike, Footprints } from 'lucide-react'

const ActivityMap = dynamic(
  () => import('@/components/ActivityMap').then((m) => m.ActivityMap),
  { ssr: false }
)


interface Props {
  params: { id: string }
}

export default async function ActivityDetailPage({ params }: Props) {
  const session = await getSessionWithRefresh()
  if (!session?.access_token) redirect('/')

  const activityId = parseInt(params.id, 10)
  if (isNaN(activityId)) redirect('/dashboard')

  const [activity, comments, athlete, photos] = await Promise.all([
    fetchActivity(session.access_token, activityId),
    fetchActivityComments(session.access_token, activityId),
    fetchAthlete(session.access_token),
    fetchActivityPhotos(session.access_token, activityId),
  ])

  const hasPolyline = !!(activity.map?.summary_polyline)

  // Derive start coordinates from the polyline (avoids caching start_latlng per Strava ToS)
  const weatherCoords: [number, number] | undefined = hasPolyline
    ? (polyline.decode(activity.map.summary_polyline)[0] as [number, number] | undefined)
    : undefined

  return (
    <>
      <ActivityPageTracker sportType={activity.sport_type} />
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/dashboard" className="hover:text-[var(--accent)] transition-colors">
            {athlete.firstname} {athlete.lastname}
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/sport/${activity.sport_type}`}
            className="hover:text-[var(--accent)] transition-colors"
          >
            {getSportLabel(activity.sport_type)}
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300 truncate">{activity.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <SportIcon sport={activity.sport_type} size={22} className="text-gray-500 dark:text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activity.name}</h1>
            <ActivityBadge visibility={activity.visibility} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(activity.start_date_local)}
            {activity.device_name && (
              <span className="ml-3 text-gray-400 dark:text-gray-500">via {activity.device_name}</span>
            )}
          </p>
          {activity.description && (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {activity.description}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <ActivityStatsChips
          distance={activity.distance}
          moving_time={activity.moving_time}
          elapsed_time={activity.elapsed_time}
          total_elevation_gain={activity.total_elevation_gain}
          average_heartrate={activity.average_heartrate}
          max_heartrate={activity.max_heartrate}
          calories={activity.calories}
          suffer_score={activity.suffer_score}
          achievement_count={activity.achievement_count}
          pr_count={activity.pr_count}
          sport_type={activity.sport_type}
        />

        {/* Map */}
        {hasPolyline && (
          <div className="mb-6 border border-gray-200 dark:border-[#30363d] rounded-lg overflow-hidden">
            <ActivityMap summaryPolyline={activity.map.summary_polyline} />
          </div>
        )}

        {/* Weather */}
        {weatherCoords && (
          <WeatherCard
            lat={weatherCoords[0]}
            lon={weatherCoords[1]}
            startDate={activity.start_date}
          />
        )}

        {/* Gear + Athletes row */}
        {(activity.gear || activity.athlete_count > 1) && (
          <div className="mb-6 flex flex-wrap gap-3">
            {activity.gear && (
              <div className="flex-1 min-w-[200px] p-4 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Gear</h2>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  {['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike'].includes(activity.sport_type)
                    ? <Footprints size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    : <Bike size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  }
                  <span className="font-medium">{activity.gear.name}</span>
                  <span className="text-gray-400 dark:text-gray-500">·</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    <GearDistance meters={activity.gear.distance} /> lifetime
                  </span>
                </div>
              </div>
            )}
            {activity.athlete_count > 1 && (
              <div className="flex-1 min-w-[200px] p-4 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Users2 size={16} className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <span>
                  <strong className="font-semibold">{activity.athlete_count}</strong> athletes did this activity together
                </span>
              </div>
            )}
          </div>
        )}

        {/* Splits */}
        <SplitsTable
          splitsMetric={activity.splits_metric}
          splitsImperial={activity.splits_imperial}
          sportType={activity.sport_type}
        />

        {/* Laps */}
        <LapsTable laps={activity.laps ?? []} sportType={activity.sport_type} />

        {/* Photos */}
        {photos.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Photos ({photos.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {photos.map((photo) =>
                photo.urls['600'] ? (
                  <div key={photo.unique_id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-[#161b22]">
                    <Image
                      src={photo.urls['600']}
                      alt="Activity photo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Comments ({comments.length})
            </h2>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg"
                >
                  {comment.athlete.profile_medium && (
                    <Image
                      src={comment.athlete.profile_medium}
                      alt={`${comment.athlete.firstname} ${comment.athlete.lastname}`}
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.athlete.firstname} {comment.athlete.lastname}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
