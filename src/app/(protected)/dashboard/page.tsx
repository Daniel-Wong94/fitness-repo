import { Suspense } from 'react'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getSessionWithRefresh } from '@/lib/auth'
import {
  fetchAthlete,
  fetchAllActivities,
  fetchRecentActivities,
  fetchAthleteStats,
  fetchClubs,
  computeSportStats,
} from '@/lib/strava'
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { StatsBar } from '@/components/StatsBar'
import { SportTypeCard } from '@/components/SportTypeCard'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ClubsList } from '@/components/ClubsList'
import { TrophyCase } from '@/components/TrophyCase'
import { TutorialOverlay, DashboardReadySignal } from '@/components/TutorialOverlay'
import { computeTrophies } from '@/lib/trophies'
import { CLUBS_ENABLED } from '@/config'
import { User, MapPin, Users2 } from 'lucide-react'

// Deduplicate fetches across the render tree for this request
const cachedFetchAthlete = cache(fetchAthlete)
const cachedFetchClubs = cache(fetchClubs)
const cachedFetchAllActivities = cache(fetchAllActivities)
const cachedFetchRecentActivities = cache(fetchRecentActivities)
const cachedFetchAthleteStats = cache(fetchAthleteStats)

function toXL(url: string): string {
  return url.replace('large.jpg', 'xl.jpg')
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SidebarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full max-w-[260px] aspect-square rounded-full bg-gray-200 dark:bg-[#30363d] mb-4" />
      <div className="h-6 w-36 bg-gray-200 dark:bg-[#30363d] rounded mb-2" />
      <div className="h-4 w-24 bg-gray-200 dark:bg-[#30363d] rounded mb-4" />
      <div className="h-3 w-32 bg-gray-200 dark:bg-[#30363d] rounded mb-2" />
      <div className="h-3 w-28 bg-gray-200 dark:bg-[#30363d] rounded mb-6" />
      <ClubsSkeleton />
    </div>
  )
}

function ClubsSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="h-3 w-10 bg-gray-200 dark:bg-[#30363d] rounded mb-3" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-[#30363d] flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 w-28 bg-gray-200 dark:bg-[#30363d] rounded mb-1" />
              <div className="h-2 w-20 bg-gray-200 dark:bg-[#30363d] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MainContentSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats bar */}
      <div className="flex gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 flex-1 bg-gray-200 dark:bg-[#30363d] rounded-lg" />
        ))}
      </div>
      {/* Heatmap */}
      <div className="h-36 bg-gray-200 dark:bg-[#30363d] rounded-lg mb-6" />
      {/* Sport cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-[#30363d] rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-[#30363d] rounded-lg" />
      ))}
    </div>
  )
}

// ─── Async RSC sections ───────────────────────────────────────────────────────

async function AthleteSidebar({ token }: { token: string }) {
  const athlete = await cachedFetchAthlete(token)

  const location = [athlete.city, athlete.state, athlete.country]
    .filter(Boolean)
    .join(', ')

  return (
    <>
      {/* Avatar */}
      <div className="mb-4">
        <div
          className={`w-fit rounded-full ${athlete.premium ? 'p-[3px]' : ''}`}
          style={athlete.premium ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' } : undefined}
        >
          {athlete.profile ? (
            <Image
              src={toXL(athlete.profile)}
              alt={`${athlete.firstname} ${athlete.lastname}`}
              width={260}
              height={260}
              className={`rounded-full block ${athlete.premium ? 'border-2 border-white dark:border-[#0d1117]' : 'border-2 border-gray-200 dark:border-[#30363d]'}`}
              unoptimized
            />
          ) : (
            <div className={`w-full max-w-[260px] aspect-square rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${athlete.premium ? 'border-2 border-white dark:border-[#0d1117]' : 'border-2 border-gray-200 dark:border-[#30363d]'}`}>
              <User size={80} className="text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
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
          <MapPin size={14} />
          {location}
        </div>
      )}

      {/* Followers / Following */}
      {(athlete.follower_count != null || athlete.friend_count != null) && (
        <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600 dark:text-gray-400">
          <Users2 size={14} className="flex-shrink-0" />
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
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Bio</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{athlete.bio}</p>
        </div>
      )}

      {/* Clubs — independent Suspense: stays skeleton if clubs haven't resolved yet */}
      {CLUBS_ENABLED && (
        <Suspense fallback={<ClubsSkeleton />}>
          <ClubsSection token={token} />
        </Suspense>
      )}
    </>
  )
}

async function ClubsSection({ token }: { token: string }) {
  const clubs = await cachedFetchClubs(token)
  if (clubs.length === 0) return null
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
        Clubs
      </h2>
      <ClubsList clubs={clubs} />
    </div>
  )
}

async function MainContent({ token }: { token: string }) {
  const athlete = await cachedFetchAthlete(token)
  const [activities, athleteStats] = await Promise.all([
    cachedFetchAllActivities(token),
    cachedFetchAthleteStats(token, athlete.id),
  ])

  const createdYear = athlete.created_at
    ? new Date(athlete.created_at).getFullYear()
    : new Date().getFullYear()

  const sportStats = computeSportStats(activities)
  const pinnedSports = sportStats.slice(0, 4)
  const otherSports = sportStats.slice(4)
  const trophies = computeTrophies(activities)

  return (
    <>
      <div data-tour="lifetime-stats">
        <StatsBar activities={activities} athleteStats={athleteStats} />
      </div>

      <div data-tour="heatmap" className="mt-6 p-4 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
        <HeatmapGrid activities={activities} createdYear={createdYear} />
      </div>

      {pinnedSports.length > 0 && (
        <div data-tour="pinned-sports" className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Pinned sports</h2>
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

      <div data-tour="trophy-case">
        <TrophyCase trophies={trophies} />
      </div>

      <DashboardReadySignal />
    </>
  )
}

async function FeedSection({ token }: { token: string }) {
  const activities = await cachedFetchRecentActivities(token)
  return (
    <div data-tour="recent-activities" className="mt-8">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activities</h2>
      <ActivityFeed activities={activities} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getSessionWithRefresh()
  if (!session?.access_token) redirect('/')

  const token = session.access_token

  // Start all fetches in parallel. React.cache deduplicates so each
  // async RSC below gets the same in-flight promise when it calls its fetch.
  // Note: athleteStats pre-warm requires athlete.id, so it starts inside MainContent.
  cachedFetchAthlete(token)
  if (CLUBS_ENABLED) cachedFetchClubs(token)
  cachedFetchAllActivities(token)
  cachedFetchRecentActivities(token)

  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<SidebarSkeleton />}>
              <AthleteSidebar token={token} />
            </Suspense>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={<MainContentSkeleton />}>
              <MainContent token={token} />
            </Suspense>
            <Suspense fallback={<FeedSkeleton />}>
              <FeedSection token={token} />
            </Suspense>
          </main>
        </div>
      </div>
      <TutorialOverlay />
    </>
  )
}
