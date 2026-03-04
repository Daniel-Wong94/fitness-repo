import Image from 'next/image'
import type { ClubMember } from '@/lib/types'

interface Props {
  members: ClubMember[]
}

const MAX_SHOWN = 20

export function ClubMembersList({ members }: Props) {
  const shown = members.slice(0, MAX_SHOWN)
  const extra = members.length - shown.length

  return (
    <ul className="space-y-2">
      {shown.map((member, i) => {
        const name = `${member.firstname} ${member.lastname}`
        const initials = `${member.firstname[0] ?? ''}${member.lastname[0] ?? ''}`
        return (
          <li key={i} className="flex items-center gap-2">
            {member.profile_medium ? (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <Image
                  src={member.profile_medium}
                  alt={name}
                  width={32}
                  height={32}
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {initials}
              </div>
            )}
            <span className="text-sm text-gray-900 dark:text-[#e6edf3] truncate">{name}</span>
          </li>
        )
      })}
      {extra > 0 && (
        <li className="text-xs text-gray-500 dark:text-[#8b949e] pt-1">
          + {extra} more member{extra !== 1 ? 's' : ''}
        </li>
      )}
    </ul>
  )
}
