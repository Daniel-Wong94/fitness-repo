import type { StravaActivity, StravaAthlete, StravaClub, SportStats } from './types'

export type Units = 'metric' | 'imperial'

const STRAVA_API = 'https://www.strava.com/api/v3'

export async function fetchAthlete(accessToken: string): Promise<StravaAthlete> {
  const res = await fetch(`${STRAVA_API}/athlete`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to fetch athlete: ${res.status}`)
  return res.json()
}

export async function fetchActivities(
  accessToken: string,
  after: number,
  page = 1,
  perPage = 200
): Promise<StravaActivity[]> {
  const res = await fetch(
    `${STRAVA_API}/athlete/activities?after=${after}&page=${page}&per_page=${perPage}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    }
  )
  if (!res.ok) throw new Error(`Failed to fetch activities: ${res.status}`)
  return res.json()
}

export async function fetchClubs(accessToken: string): Promise<StravaClub[]> {
  const res = await fetch(`${STRAVA_API}/athlete/clubs`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to fetch clubs: ${res.status}`)
  return res.json()
}

export function get52WeeksAgo(): number {
  const date = new Date()
  date.setDate(date.getDate() - 364)
  return Math.floor(date.getTime() / 1000)
}

export function computeSportStats(activities: StravaActivity[]): SportStats[] {
  const sportMap = new Map<
    string,
    {
      count: number
      total_distance: number
      total_time: number
      total_elevation: number
      total_kudos: number
      total_partners: number
    }
  >()

  for (const activity of activities) {
    const st = activity.sport_type
    const existing = sportMap.get(st) ?? {
      count: 0,
      total_distance: 0,
      total_time: 0,
      total_elevation: 0,
      total_kudos: 0,
      total_partners: 0,
    }
    sportMap.set(st, {
      count: existing.count + 1,
      total_distance: existing.total_distance + activity.distance,
      total_time: existing.total_time + activity.moving_time,
      total_elevation: existing.total_elevation + activity.total_elevation_gain,
      total_kudos: existing.total_kudos + (activity.kudos_count || 0),
      total_partners: existing.total_partners + Math.max(0, (activity.athlete_count || 1) - 1),
    })
  }

  return Array.from(sportMap.entries())
    .map(([sport_type, stats]) => ({ sport_type, ...stats }))
    .sort((a, b) => b.count - a.count)
}

export function formatDistance(meters: number, units: Units = 'metric'): string {
  if (units === 'imperial') {
    const miles = meters / 1609.344
    if (miles < 0.1) return `${Math.round(meters * 3.28084)}ft`
    return `${miles.toFixed(1)}mi`
  }
  const km = meters / 1000
  if (km < 1) return `${Math.round(meters)}m`
  return `${km.toFixed(1)}km`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatPace(metersPerSecond: number, units: Units = 'metric'): string {
  if (!metersPerSecond || metersPerSecond <= 0) return '—'
  if (units === 'imperial') {
    const secPerMile = 1609.344 / metersPerSecond
    const min = Math.floor(secPerMile / 60)
    const sec = Math.round(secPerMile % 60)
    return `${min}:${sec.toString().padStart(2, '0')}/mi`
  }
  const secPerKm = 1000 / metersPerSecond
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

export function formatSpeed(metersPerSecond: number, units: Units = 'metric'): string {
  if (units === 'imperial') return `${(metersPerSecond * 2.23694).toFixed(1)} mph`
  return `${(metersPerSecond * 3.6).toFixed(1)} km/h`
}

export function formatElevation(meters: number, units: Units = 'metric'): string {
  if (units === 'imperial') return `${Math.round(meters * 3.28084)}ft`
  return `${Math.round(meters)}m`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getSportIcon(sportType: string): string {
  const icons: Record<string, string> = {
    Run: '🏃',
    Ride: '🚴',
    Swim: '🏊',
    Walk: '🚶',
    Hike: '🥾',
    AlpineSki: '⛷️',
    BackcountrySki: '🎿',
    Canoeing: '🛶',
    Crossfit: '💪',
    EBikeRide: '⚡',
    Elliptical: '🏋️',
    Golf: '⛳',
    IceSkate: '⛸️',
    InlineSkate: '🛼',
    Kayaking: '🚣',
    Kitesurf: '🪁',
    NordicSki: '⛷️',
    RockClimbing: '🧗',
    RollerSki: '🎿',
    Rowing: '🚣',
    Snowboard: '🏂',
    Snowshoe: '❄️',
    Soccer: '⚽',
    StairStepper: '🪜',
    StandUpPaddling: '🏄',
    Surfing: '🏄',
    TrailRun: '🏃',
    VirtualRide: '💻',
    VirtualRun: '💻',
    WeightTraining: '🏋️',
    Wheelchair: '♿',
    Windsurf: '🌊',
    Workout: '💪',
    Yoga: '🧘',
  }
  return icons[sportType] ?? '🏅'
}

export function getSportLabel(sportType: string): string {
  const labels: Record<string, string> = {
    Run: 'Running',
    Ride: 'Cycling',
    Swim: 'Swimming',
    Walk: 'Walking',
    Hike: 'Hiking',
    TrailRun: 'Trail Running',
    VirtualRide: 'Virtual Cycling',
    VirtualRun: 'Virtual Running',
    WeightTraining: 'Weight Training',
    Workout: 'Workout',
    Yoga: 'Yoga',
    EBikeRide: 'E-Bike',
    Rowing: 'Rowing',
    Kayaking: 'Kayaking',
    Crossfit: 'CrossFit',
    RockClimbing: 'Rock Climbing',
    AlpineSki: 'Alpine Ski',
    NordicSki: 'Nordic Ski',
    Snowboard: 'Snowboard',
    Soccer: 'Soccer',
    Surfing: 'Surfing',
    Canoeing: 'Canoeing',
    Elliptical: 'Elliptical',
    Golf: 'Golf',
    IceSkate: 'Ice Skating',
    InlineSkate: 'Inline Skating',
    Kitesurf: 'Kitesurfing',
    StairStepper: 'Stair Stepper',
    StandUpPaddling: 'Stand Up Paddling',
    Wheelchair: 'Wheelchair',
    Windsurf: 'Windsurfing',
  }
  return labels[sportType] ?? sportType
}

export function computeStreak(activities: StravaActivity[]): number {
  if (!activities.length) return 0

  const dates = new Set(
    activities.map((a) => a.start_date_local.split('T')[0])
  )

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (dates.has(dateStr)) {
      streak++
    } else if (i === 0) {
      // Today has no activity yet, check from yesterday
      continue
    } else {
      break
    }
  }

  return streak
}
