import { Trophy } from '@/lib/trophies'

interface TrophyCaseProps {
  trophies: Trophy[]
}

const FIRST_ROW = 5

function TrophyCard({ trophy }: { trophy: Trophy }) {
  return (
    <div
      className={`p-3 rounded-lg border text-center transition-opacity
        bg-white dark:bg-[#0d1117]
        border-gray-200 dark:border-[#30363d]
        ${trophy.earned ? '' : 'opacity-35 grayscale'}`}
      title={trophy.description}
    >
      <div className="text-2xl mb-1">{trophy.emoji}</div>
      <div className="text-xs font-medium text-gray-900 dark:text-white leading-tight mb-1">
        {trophy.name}
      </div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
        {trophy.description}
      </div>
    </div>
  )
}

export function TrophyCase({ trophies }: TrophyCaseProps) {
  const earned = trophies.filter((t) => t.earned).length
  const total = trophies.length
  const firstRow = trophies.slice(0, FIRST_ROW)
  const rest = trophies.slice(FIRST_ROW)

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Trophy Case</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {earned} / {total} unlocked
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {firstRow.map((trophy) => (
          <TrophyCard key={trophy.id} trophy={trophy} />
        ))}
      </div>
      {rest.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-[var(--accent)] hover:underline select-none">
            Show {rest.length} more trophy{rest.length !== 1 ? 's' : ''}
          </summary>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
            {rest.map((trophy) => (
              <TrophyCard key={trophy.id} trophy={trophy} />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
