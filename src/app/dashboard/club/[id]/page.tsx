import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSessionWithRefresh } from '@/lib/auth'
import {
  fetchClubDetail,
  fetchClubActivities,
  fetchClubMembers,
} from '@/lib/strava'
import { ClubActivityFeed } from '@/components/ClubActivityFeed'
import { ClubMembersList } from '@/components/ClubMembersList'
import { FaRunning } from 'react-icons/fa'

interface Props {
  params: { id: string }
}

export default async function ClubDetailPage({ params }: Props) {
  const session = await getSessionWithRefresh()

  if (!session?.access_token) {
    redirect('/')
  }

  const { id } = params

  const [club, clubActivities, clubMembers] = await Promise.all([
    fetchClubDetail(session.access_token, id),
    fetchClubActivities(session.access_token, id, 1, 10),
    fetchClubMembers(session.access_token, id),
  ])

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
            Dashboard
          </Link>
          <span className="text-gray-400 dark:text-gray-600 mx-1">/</span>
          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🪩</span>
            {club.name}
          </span>
        </nav>

        {/* Cover banner + avatar */}
        <div className="relative mb-12">
          <div className="rounded-lg overflow-hidden h-80 bg-gradient-to-r from-[var(--accent)] to-purple-500 relative">
            {club.cover_photo && (
              <Image
                src={club.cover_photo}
                alt={`${club.name} cover`}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          {/* Avatar overlapping cover */}
          <div className="absolute left-4 bottom-0 translate-y-1/2 z-10">
            <div className="w-16 h-16 rounded-full border-4 border-white dark:border-[#0d1117] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {club.profile_medium ? (
                <Image
                  src={club.profile_medium}
                  alt={club.name}
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-2xl">🪩</span>
              )}
            </div>
          </div>
        </div>

        {/* Club info */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{club.name}</h1>
            {club.sport_type && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e] capitalize">
                {club.sport_type}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-[#8b949e] mt-1">
            {[club.city, club.state, club.country].filter(Boolean).join(', ')}
            {club.member_count ? ` · ${club.member_count.toLocaleString()} members` : ''}
          </p>
          {club.description && (
            <p className="text-sm text-gray-700 dark:text-[#c9d1d9] mt-3">{club.description}</p>
          )}
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            <ClubActivityFeed clubId={club.id} initialActivities={clubActivities} />
          </main>

          <aside className="lg:w-64 flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Members
            </h2>
            <ClubMembersList members={clubMembers} />
          </aside>
        </div>
      </div>
    </div>
  )
}
