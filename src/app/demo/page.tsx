import { DemoModeProvider } from '@/components/DemoModeProvider'
import { TopNav } from '@/components/TopNav'
import { Footer } from '@/components/Footer'
import { StatsBar } from '@/components/StatsBar'
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { SportTypeCard } from '@/components/SportTypeCard'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ClubsList } from '@/components/ClubsList'
import { TrophyCase } from '@/components/TrophyCase'
import { computeSportStats } from '@/lib/strava'
import { computeTrophies } from '@/lib/trophies'
import {
  DEMO_ATHLETE,
  DEMO_ACTIVITIES,
  DEMO_ATHLETE_STATS,
  DEMO_CLUBS,
} from '@/lib/demo-data'
import { User, MapPin, Users2 } from 'lucide-react'

export default function DemoPage() {
  const createdYear = 2022

  const sportStats = computeSportStats(DEMO_ACTIVITIES)
  const pinnedSports = sportStats.slice(0, 4)
  const otherSports = sportStats.slice(4)
  const trophies = computeTrophies(DEMO_ACTIVITIES)

  const location = [DEMO_ATHLETE.city, DEMO_ATHLETE.state, DEMO_ATHLETE.country]
    .filter(Boolean)
    .join(', ')

  return (
    <DemoModeProvider>
    <>
      {/* Demo banner */}
      <div className="sticky top-0 z-50 bg-[#FC4C02] text-white text-center text-sm py-2 px-4 font-medium">
        You&apos;re viewing demo data —{' '}
        <a href="/api/auth/strava" className="underline font-semibold">
          Connect with Strava
        </a>{' '}
        to see your real stats
      </div>

      <TopNav athlete={DEMO_ATHLETE} sticky={false} />

      <div className="flex flex-col min-h-screen bg-white dark:bg-[#0d1117]">
        <div className="flex-1">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                {/* Avatar */}
                <div className="mb-4">
                  <div
                    className="w-fit rounded-full p-[3px]"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                  >
                    <div className="w-full max-w-[260px] aspect-square rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-[#0d1117]">
                      <User size={80} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {DEMO_ATHLETE.firstname} {DEMO_ATHLETE.lastname}
                </h1>
                {DEMO_ATHLETE.username && (
                  <p className="text-lg text-gray-500 dark:text-[#8b949e] mt-0.5">
                    @{DEMO_ATHLETE.username}
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
                {(DEMO_ATHLETE.follower_count != null || DEMO_ATHLETE.friend_count != null) && (
                  <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <Users2 size={14} className="flex-shrink-0" />
                    <span>
                      <strong className="font-semibold text-gray-900 dark:text-white">
                        {(DEMO_ATHLETE.follower_count ?? 0).toLocaleString()}
                      </strong>
                      {' '}followers
                      <span className="mx-1">·</span>
                      <strong className="font-semibold text-gray-900 dark:text-white">
                        {(DEMO_ATHLETE.friend_count ?? 0).toLocaleString()}
                      </strong>
                      {' '}following
                    </span>
                  </div>
                )}

                {/* Bio */}
                {DEMO_ATHLETE.bio && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Bio</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {DEMO_ATHLETE.bio}
                    </p>
                  </div>
                )}

                {/* Clubs */}
                {DEMO_CLUBS.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                      Clubs
                    </h2>
                    <ClubsList clubs={DEMO_CLUBS} />
                  </div>
                )}
              </aside>

              {/* Main content */}
              <main className="flex-1 min-w-0">
                <StatsBar activities={DEMO_ACTIVITIES} athleteStats={DEMO_ATHLETE_STATS} />

                <div className="mt-6 p-4 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
                  <HeatmapGrid activities={DEMO_ACTIVITIES} createdYear={createdYear} />
                </div>

                {pinnedSports.length > 0 && (
                  <div className="mt-6">
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

                <TrophyCase trophies={trophies} />

                <div className="mt-8">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activities</h2>
                  <ActivityFeed activities={DEMO_ACTIVITIES.slice(0, 30)} />
                </div>
              </main>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
    </DemoModeProvider>
  )
}
