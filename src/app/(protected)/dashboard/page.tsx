import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getSessionWithRefresh } from '@/lib/auth'
import {
  fetchAthlete,
  fetchAllActivities,
  fetchClubs,
  computeSportStats,
} from '@/lib/strava'
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { StatsBar } from '@/components/StatsBar'
import { SportTypeCard } from '@/components/SportTypeCard'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ClubsList } from '@/components/ClubsList'

function toXL(url: string): string {
  return url.replace('large.jpg', 'xl.jpg')
}

export default async function DashboardPage() {
  const session = await getSessionWithRefresh()

  if (!session?.access_token) {
    redirect('/')
  }

  const [athlete, clubs] = await Promise.all([
    fetchAthlete(session.access_token),
    fetchClubs(session.access_token),
  ])

  const createdYear = athlete.created_at
    ? new Date(athlete.created_at).getFullYear()
    : new Date().getFullYear()

  const activities = await fetchAllActivities(session.access_token)

  const sportStats = computeSportStats(activities)
  const pinnedSports = sportStats.slice(0, 4)
  const otherSports = sportStats.slice(4)

  const location = [athlete.city, athlete.state, athlete.country]
    .filter(Boolean)
    .join(', ')

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar: profile */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Avatar */}
            <div className="mb-4">
              {athlete.profile ? (
                <Image
                  src={toXL(athlete.profile)}
                  alt={`${athlete.firstname} ${athlete.lastname}`}
                  width={260}
                  height={260}
                  className="rounded-full w-full max-w-[260px] border-2 border-gray-200 dark:border-[#30363d]"
                  unoptimized
                />
              ) : (
                <div className="w-full max-w-[260px] aspect-square rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-6xl">
                  👤
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {athlete.firstname} {athlete.lastname}
            </h1>
            {athlete.username && (
              <p className="text-lg text-gray-500 dark:text-[#8b949e] mt-0.5">
                @{athlete.username}
              </p>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 1a4.5 4.5 0 0 0-4.5 4.5C3.5 9.276 8 15 8 15s4.5-5.724 4.5-9.5A4.5 4.5 0 0 0 8 1zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
                    clipRule="evenodd"
                  />
                </svg>
                {location}
              </div>
            )}

            {/* Followers / Following */}
            {(athlete.follower_count != null || athlete.friend_count != null) && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5zM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5z" />
                </svg>
                <span>
                  <strong className="font-semibold text-gray-900 dark:text-white">{(athlete.follower_count ?? 0).toLocaleString()}</strong>
                  {' '}followers
                  <span className="mx-1">·</span>
                  <strong className="font-semibold text-gray-900 dark:text-white">{(athlete.friend_count ?? 0).toLocaleString()}</strong>
                  {' '}following
                </span>
              </div>
            )}

            {/* Bio */}
            {athlete.bio && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Bio
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {athlete.bio}
                </p>
              </div>
            )}

            {/* Clubs */}
            {clubs.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M14.5 6c0 4.833-5.052 8.664-6.034 9.329a1 1 0 0 1-1.932 0C5.552 14.664.5 10.833.5 6a7 7 0 0 1 14 0Z" />
                  </svg>
                  Clubs
                </h2>
                <ClubsList clubs={clubs} />
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Stats bar */}
            <StatsBar activities={activities} />

            {/* Heatmap */}
            <div className="mt-6 p-4 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
              <HeatmapGrid activities={activities} createdYear={createdYear} />
            </div>

            {/* Pinned sport cards */}
            {pinnedSports.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Pinned sports
                  </h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {sportStats.length} sport{sportStats.length !== 1 ? 's' : ''} total
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pinnedSports.map((sport) => (
                    <SportTypeCard key={sport.sport_type} sport={sport} pinned />
                  ))}
                </div>
              </div>
            )}

            {/* Other sports (collapsible via details/summary) */}
            {otherSports.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-[var(--accent)] hover:underline select-none">
                  Show {otherSports.length} more sport{otherSports.length !== 1 ? 's' : ''}
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {otherSports.map((sport) => (
                    <SportTypeCard key={sport.sport_type} sport={sport} />
                  ))}
                </div>
              </details>
            )}

            {/* Activity feed */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Recent Activities
              </h2>
              <ActivityFeed activities={activities} />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
