# Strava Dashboard

A GitHub-style personal dashboard for your Strava data. Connect your Strava account and get a clean, read-only view of your entire athletic history — heatmap, sport breakdowns, lifetime stats, activity feed, detailed activity pages with maps and weather, Strava clubs, and a trophy case of quirky achievements earned from your data.

Built with Next.js 14 App Router and deployed to Vercel. No database — all data is fetched directly from the Strava API per request.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Development Approaches](#development-approaches)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Activity heatmap** — GitHub contribution-style grid across your full Strava history, total activity time per day, color-themed
- **Lifetime stats** — total distance, elevation, time, and activity count pulled from the Strava Athlete Stats endpoint
- **Sport breakdowns** — pinned sport cards (like Github's Repo) for your top 4 sports, with drill-down pages per sport
- **Activity feed** — paginated list of recent activities with distance, pace, and elevation
- **Activity detail pages** — interactive MapLibre map rendered from the encoded polyline, weather (Open Meteo API) at start, splits/laps table, photos, comments, gear
- **Trophy case** — 22 custom achievements computed entirely from your activity data
- **Strava clubs** — sidebar list of your clubs with member feeds and club detail pages
- **Settings** — metric/imperial units, light/dark/system theme, heatmap color, all stored in `localStorage` with no backend
- **Token auto-refresh** — sessions stay alive for 30 days; tokens are refreshed transparently before they expire

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.35 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Auth / Sessions | iron-session v8 |
| Maps | MapLibre GL + @mapbox/polyline |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Installation

**Prerequisites:** Node.js 18+, a Strava API application

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/strava-dashboard.git
   cd strava-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and fill in your values (see [Environment Variables](#environment-variables)):

   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

5. Build for production:

   ```bash
   npm run build
   npm run start
   ```

### Creating a Strava API Application

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Create a new application
3. Set the **Authorization Callback Domain** to `localhost` for local development or your production domain for deployment
4. Copy the **Client ID** and **Client Secret** into your `.env.local`

---

## Environment Variables

Create a `.env.local` file at the project root with the following keys:

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret

# Must be at least 32 characters — used to AES-encrypt the session cookie
SESSION_SECRET=a_very_long_random_secret_string_here

# No trailing slash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

For production on Vercel, add these same variables in your project's **Settings > Environment Variables** dashboard. Set `NEXT_PUBLIC_BASE_URL` to your deployed URL (e.g. `https://your-app.vercel.app`).

---

## Usage

1. Open the app and click **Connect with Strava**
2. Authorize the app with the `read` and `activity:read_all` scopes
3. You are redirected to your dashboard — the sidebar, heatmap, sport cards, and activity feed all load progressively
4. Click any sport card to drill into a sport-specific page with bests, gear breakdown, and a filtered activity feed
5. Click any activity row to open the full activity detail page
6. Access **Settings** from the top nav to change units, theme, or heatmap color
7. Click **Logout** to destroy the session

---

## Project Structure

```
src/
  app/
    page.tsx                              # Landing page with Connect button
    layout.tsx                            # Anti-flash script + SettingsProvider
    (protected)/
      layout.tsx                          # Top nav + footer shell
      dashboard/
        page.tsx                          # Main dashboard (async RSC, Suspense streaming)
        loading.tsx                       # Route-level skeleton
        activity/[id]/page.tsx            # Activity detail with map, weather, splits
        club/[id]/page.tsx                # Club detail with member list + feed
        sport/[sport_type]/page.tsx       # Per-sport drilldown
      settings/
        page.tsx                          # Auth check server component
        SettingsPanel.tsx                 # Client component — theme/units/heatmap UI
  api/
    auth/strava/route.ts                  # OAuth redirect to Strava
    auth/callback/route.ts                # Token exchange + session save
    auth/logout/route.ts                  # POST -> session.destroy() -> redirect /
    clubs/[id]/activities/route.ts        # Proxies club activity feed
    weather/route.ts                      # Fetches weather for activity coordinates
  components/                             # All UI components (client + server)
  lib/
    auth.ts                               # getSession(), getSessionWithRefresh()
    strava.ts                             # All Strava API fetches + formatters
    trophies.ts                           # computeTrophies() — pure data logic
    types.ts                              # Shared TypeScript types
    settings-context.tsx                  # SettingsProvider + useSettings()
    colors.ts                             # Shared color utilities
  config.ts                               # Feature flags (CLUBS_ENABLED)
  middleware.ts                           # Redirects unauthenticated /dashboard + /settings to /
```

---

## Development Approaches

This section documents the key architectural decisions made during development — including the problems we ran into and how we solved them.

---

### 1. No-Database Architecture with React.cache() Deduplication

**Problem:** The dashboard is a server-rendered page with multiple async components (sidebar, main content, feed) that all need the same data. Naive implementations either fetch the same data multiple times or require complex prop-drilling from a single top-level fetch.

**Solution:** We use Next.js's built-in fetch deduplication combined with `React.cache()`. Each data-fetching function is wrapped with `cache()` at the page level:

```ts
const cachedFetchAthlete = cache(fetchAthlete)
const cachedFetchAllActivities = cache(fetchAllActivities)
```

These cached wrappers are called at the top of the page to "pre-warm" the cache, then called again inside each async RSC. React deduplicates the calls by reference — every component gets the same in-flight promise, not a duplicate request. This means zero extra Strava API calls regardless of how many components share the same data, with no database, no Redis, and no prop drilling.

---

### 2. Progressive Rendering with Independent Suspense Boundaries

**Problem:** Wrapping the entire dashboard in a single `<Suspense>` means users see a blank skeleton until the slowest data dependency resolves — for users with 1,000+ activities this could be several seconds of nothing.

**Solution:** We split the dashboard into independent `<Suspense>` subtrees, each with its own skeleton fallback:

```tsx
{/* Sidebar: resolves as soon as athlete profile loads (~200ms) */}
<Suspense fallback={<SidebarSkeleton />}>
  <AthleteSidebar token={token} />
</Suspense>

{/* Main content: waits for all activities (heatmap, sport cards, trophies) */}
<Suspense fallback={<MainContentSkeleton />}>
  <MainContent token={token} />
</Suspense>

{/* Feed: streams from page-1 cache hit while full fetch is still in-flight */}
<Suspense fallback={<FeedSkeleton />}>
  <FeedSection token={token} />
</Suspense>
```

The sidebar becomes interactive before the activity data arrives. The activity feed appears almost immediately from a cached page-1 response while heavier computations (heatmap, sport stats, trophy calculation) are still resolving.

---

### 3. Parallelized Activity Pagination

**Problem:** The Strava API returns activities 200 at a time. The original implementation used a sequential `while` loop — each page waited for the previous one before starting. For a user with 2,000 activities (10 pages), this meant ~10 × 200ms = 2 seconds of pure serial wait time.

**Solution:** We replaced the sequential loop with a batched-parallel fetch strategy using `Promise.all`:

```ts
const BATCH = 5 // pages to fetch in parallel per round

export async function fetchAllActivities(accessToken: string): Promise<StravaActivity[]> {
  const first = await fetchPage(accessToken, 1)
  if (first.length < 200) return first          // most users done here

  const all = [...first]
  let startPage = 2

  while (true) {
    const pages = await Promise.all(
      Array.from({ length: BATCH }, (_, i) => fetchPage(accessToken, startPage + i))
    )
    for (const page of pages) {
      all.push(...page)
      if (page.length < 200) return all         // found the last page
    }
    startPage += BATCH
  }
}
```

10 sequential pages become 2 parallel batches of 5. Wall-clock time for a 2,000-activity user drops from ~2s to ~400ms. Total request count is identical — only concurrency increases — so there is no additional pressure on Strava's rate limit (200 req/15min per user).

---

### 4. Streaming the Activity Feed from a Cached Page-1 Response

**Problem:** The activity feed (`ActivityFeed`) was rendered inside `MainContent`, which waited for *all* pages of activities before rendering anything. Users had to wait for the full parallel fetch to complete even though the feed only ever displays recent activities.

**Solution:** We extracted a dedicated `FeedSection` RSC that calls `fetchRecentActivities` — a single-page fetch that returns only the 200 most recent activities:

```ts
export async function fetchRecentActivities(accessToken: string): Promise<StravaActivity[]> {
  return fetchPage(accessToken, 1)
}
```

Because `fetchPage` constructs the same URL as page 1 of `fetchAllActivities`, Next.js deduplicates the fetch — this shares the cached response and makes zero additional API calls. `FeedSection` is wrapped in its own `<Suspense>` and resolves in ~300ms (a single round-trip), while `MainContent` continues its parallel pagination behind its own boundary.

---

### 5. Token Auto-Refresh without a Background Job

**Problem:** Strava access tokens expire every 6 hours. Letting a token expire silently means API calls start failing mid-session. Running a background cron job to refresh tokens is unnecessary complexity for a stateless, per-request architecture.

**Solution:** `getSessionWithRefresh()` is called at the top of every protected server component. It reads the session from the encrypted cookie and checks the `expires_at` timestamp. If the token expires within the next 5 minutes, it fires a refresh POST to Strava inline, saves the new tokens back to the cookie, and returns the live session — all in the same request:

```ts
if (session.expires_at && Date.now() / 1000 > session.expires_at - 300) {
  // refresh token inline, save to cookie, continue
}
```

Sessions are valid for 30 days. No background job, no database, no token table.

---

### 6. Dark Mode without Flash

**Problem:** Reading the user's theme preference from `localStorage` happens in the browser *after* the HTML is parsed and React hydrates. Without intervention, users on dark mode see a white flash of the default light background on every page load.

**Solution:** A small inline `<script>` tag is injected directly into the `<head>` in `layout.tsx`, before any CSS or React code runs. It reads `localStorage` synchronously and applies the `dark` class to `<html>` before the browser paints the first frame. This is a standard anti-flash pattern, and because it runs synchronously in `<head>`, there is no visible flash even on slow connections.

---

### 7. Activity Maps without SSR

**Problem:** MapLibre GL accesses browser-only APIs (`window`, `document`, WebGL context) at import time. Importing it in a server component or allowing it to be server-rendered causes a build error.

**Solution:** The `ActivityMap` component is loaded with Next.js's `dynamic()` and `{ ssr: false }`:

```ts
const ActivityMap = dynamic(
  () => import('@/components/ActivityMap').then((m) => m.ActivityMap),
  { ssr: false }
)
```

This defers the import entirely to the client bundle. The map placeholder renders on the server, and MapLibre only initializes once the component mounts in the browser. The route polyline is decoded server-side from Strava's encoded format using `@mapbox/polyline` and passed as coordinates to the client component.

---

### 8. Strava ToS Compliance

Several implementation decisions exist specifically to respect the Strava API Agreement:

- **Read-only scope:** The app only requests `read` and `activity:read_all`. It never writes to Strava.
- **Clubs feature flag:** Strava API Agreement §6.3 restricts club data access to non-commercial apps under 10,000 users. The clubs feature is controlled by a single `CLUBS_ENABLED` constant in `src/config.ts` so it can be toggled off app-wide if that exception no longer applies.
- **Start coordinates from polyline:** The activity detail page derives the weather fetch coordinates by decoding the route polyline rather than using `start_latlng` directly. This avoids caching precise start location data in a way that could conflict with athlete privacy settings.

---

### 9. Quirky Trophy System — Local Time Parsing

**Problem:** Strava appends a `Z` (UTC) suffix to `start_date_local` values even though the timestamp is already in local time. Parsing these strings with `new Date()` or `.getTimezoneOffset()` applies a timezone shift, producing wrong hours for trophies like "Night Owl" (00:00–03:59 AM) or "Early Bird" (05:00–05:59 AM).

**Solution:** All trophy logic in `src/lib/trophies.ts` parses the timestamp as a plain string rather than a `Date` object:

```ts
function localHour(dateStr: string): number {
  return parseInt(dateStr.slice(11, 13), 10) // extract HH directly
}
```

This reads the hour field literally from the ISO string, bypassing JavaScript's date parsing entirely. The same approach is used for day-of-week and calendar-date comparisons in streak and trophy calculations.

---

## Contributing

This project is personal-use software. If you find a bug or want to propose an improvement:

1. Fork the repository
2. Create a feature branch: `git checkout -b fix/your-fix-name`
3. Make your changes and ensure `npm run build` passes with no type errors
4. Open a pull request with a clear description of the change and why it's needed

Please do not open pull requests that add features behind your own Strava account credentials, modify the OAuth scopes beyond `read,activity:read_all`, or introduce a database dependency.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

This project is not affiliated with, endorsed by, or sponsored by Strava. Strava is a trademark of Strava, Inc. Use of the Strava API is subject to the [Strava API Agreement](https://www.strava.com/legal/api).
