import Image from 'next/image'
import Link from 'next/link'
import type { StravaClub } from '@/lib/types'

interface Props {
  clubs: StravaClub[]
}

export function ClubsList({ clubs }: Props) {
  if (clubs.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Not a member of any clubs.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {clubs.map((club) => (
        <li key={club.id} className="flex items-center gap-3">
          <Link href={`/dashboard/club/${club.id}`} className="flex items-center gap-3 min-w-0 flex-1 group">
            {club.profile_medium ? (
              <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <Image
                  src={club.profile_medium}
                  alt={club.name}
                  width={32}
                  height={32}
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm flex-shrink-0">
                🪩
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-[#e6edf3] truncate group-hover:text-[var(--accent)] transition-colors">
                {club.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#8b949e] truncate">
                {club.member_count?.toLocaleString()} members
                {club.city ? ` · ${club.city}` : ''}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
