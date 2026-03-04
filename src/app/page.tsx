import { ConnectButton } from '@/components/ConnectButton'

export default function LandingPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-[#0d1117] dark:to-[#161b22]">
      <div className="text-center max-w-md px-6">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[var(--accent)] rounded-2xl flex items-center justify-center shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-12 h-12"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.172" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Strava Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your activity data, visualized like a GitHub profile.
          Heatmaps, streaks, and more.
        </p>

        {searchParams.error && (
          <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {searchParams.error === 'access_denied'
              ? 'Access was denied. Please try again.'
              : 'Something went wrong. Please try again.'}
          </div>
        )}

        <ConnectButton />

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-600">
          Read-only access · No data stored · All data from Strava API
        </p>
      </div>

      {/* Feature highlights */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl px-6 w-full">
        {[
          {
            icon: '🟩',
            title: 'Activity Heatmap',
            desc: '52-week activity grid, just like GitHub contributions',
          },
          {
            icon: '🏅',
            title: 'Sport Cards',
            desc: 'See your sports as repo cards with stats and details',
          },
          {
            icon: '🔥',
            title: 'Streaks & Stats',
            desc: 'Track kudos, streaks, followers, and more at a glance',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="text-center p-4 rounded-lg bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d]"
          >
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
