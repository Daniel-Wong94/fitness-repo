function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-[#30363d] ${className}`} />
}

export default function DashboardLoading() {
  return (
    <>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Avatar */}
            <Skeleton className="w-full max-w-[260px] aspect-square rounded-full" />

            {/* Name */}
            <Skeleton className="mt-4 h-7 w-40" />

            {/* Location */}
            <Skeleton className="mt-3 h-4 w-36" />

            {/* Followers */}
            <Skeleton className="mt-3 h-4 w-48" />

            {/* Bio */}
            <div className="mt-6">
              <Skeleton className="h-4 w-8 mb-3" />
              <Skeleton className="h-3 w-full mb-1.5" />
              <Skeleton className="h-3 w-5/6" />
            </div>

            {/* Clubs */}
            <div className="mt-6">
              <Skeleton className="h-4 w-12 mb-3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1 min-w-0">
            {/* Stats bar */}
            <div>
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="flex flex-wrap gap-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-24" />
                ))}
              </div>
            </div>

            {/* Heatmap */}
            <Skeleton className="mt-6 h-36 w-full rounded-lg" />

            {/* Pinned sports label */}
            <Skeleton className="mt-6 h-4 w-24" />

            {/* Sport cards */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>

            {/* Activity feed label */}
            <Skeleton className="mt-8 h-4 w-28" />

            {/* Activity rows */}
            <div className="mt-3 space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
