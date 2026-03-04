import { FaRunning } from 'react-icons/fa'

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-[#30363d] ${className}`} />
}

export default function SportDetailLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* Top nav */}
      <header className="border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaRunning size={24} className="text-[var(--accent)]" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Fitness Repo</span>
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Skeleton className="h-4 w-48 mb-6" />

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-24" />
          ))}
        </div>

        {/* Heatmap */}
        <Skeleton className="mt-6 h-36 w-full rounded-lg" />

        {/* Bests */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>

        {/* Activity feed label */}
        <Skeleton className="mt-8 h-4 w-40" />

        {/* Activity rows */}
        <div className="mt-3 space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
