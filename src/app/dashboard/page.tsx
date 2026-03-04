import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getSessionWithRefresh } from '@/lib/auth'
import {
  fetchAthlete,
  fetchActivities,
  fetchClubs,
  get52WeeksAgo,
  computeSportStats,
} from '@/lib/strava'
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { StatsBar } from '@/components/StatsBar'
import { SportTypeCard } from '@/components/SportTypeCard'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ClubsList } from '@/components/ClubsList'

export default async function DashboardPage() {
  const session = await getSessionWithRefresh()

  if (!session?.access_token) {
    redirect('/')
  }

  const [athlete, activities, clubs] = await Promise.all([
    fetchAthlete(session.access_token),
    fetchActivities(session.access_token, get52WeeksAgo()),
    fetchClubs(session.access_token),
  ])

  const sportStats = computeSportStats(activities)
  const pinnedSports = sportStats.slice(0, 4)
  const otherSports = sportStats.slice(4)

  const location = [athlete.city, athlete.state, athlete.country]
    .filter(Boolean)
    .join(', ')

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
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M6.459 1.01a.75.75 0 0 1 .99.232l.308.476a5.033 5.033 0 0 1 1.01-.005l.32-.468a.75.75 0 0 1 1.227.86l-.302.442c.196.18.378.375.543.583l.502-.17a.75.75 0 0 1 .894 1.03l-.258.515c.126.228.234.467.323.715l.547-.05a.75.75 0 0 1 .658 1.205l-.376.445c.03.247.044.498.044.752 0 .254-.015.505-.044.752l.376.445a.75.75 0 0 1-.658 1.206l-.547-.05a6.036 6.036 0 0 1-.323.715l.258.515a.75.75 0 0 1-.894 1.03l-.502-.17a5.134 5.134 0 0 1-.543.583l.302.442a.75.75 0 0 1-1.227.86l-.32-.468a5.033 5.033 0 0 1-1.01-.005l-.308.476a.75.75 0 0 1-1.222-.868l.275-.425A5.04 5.04 0 0 1 5 13.273l-.5.17a.75.75 0 0 1-.893-1.031l.257-.514a5.954 5.954 0 0 1-.323-.716l-.547.05a.75.75 0 0 1-.658-1.205l.376-.445A6.165 6.165 0 0 1 2.668 8c0-.254.015-.505.044-.752l-.376-.445a.75.75 0 0 1 .658-1.206l.547.05c.09-.248.197-.487.323-.715l-.257-.515a.75.75 0 0 1 .893-1.031l.5.17c.164-.208.346-.403.542-.583l-.274-.426a.75.75 0 0 1 .232-.99ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clipRule="evenodd" />
              </svg>
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar: profile */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Avatar */}
            <div className="mb-4">
              {athlete.profile ? (
                <Image
                  src={athlete.profile}
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
            <StatsBar activities={activities} athlete={athlete} />

            {/* Heatmap */}
            <div className="mt-6 p-4 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {activities.length} activities in the last year
              </h2>
              <HeatmapGrid activities={activities} />
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
                Recent activity
              </h2>
              <ActivityFeed activities={activities} limit={20} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
