import type { StravaAthlete, StravaActivity, StravaClub, AthleteStats } from '@/lib/types'

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed += 0x6d2b79f5
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(42)

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(min: number, max: number): number {
  return rng() * (max - min) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ─── Athlete ──────────────────────────────────────────────────────────────────

export const DEMO_ATHLETE: StravaAthlete = {
  id: 99999999,
  username: 'alexchen_runs',
  firstname: 'Alex',
  lastname: 'Chen',
  city: 'San Francisco',
  state: 'California',
  country: 'USA',
  profile: '',
  profile_medium: '',
  premium: true,
  bio: 'Running, cycling, and swimming my way through life. Chasing PRs and sunrises.',
  follower_count: 312,
  friend_count: 204,
  created_at: '2024-03-10T00:00:00Z',
  bikes: [
    { id: 'b1', name: 'Trek Domane SL 6', primary: true, distance: 8420000 },
    { id: 'b2', name: 'Canyon Neuron CF 7', primary: false, distance: 3150000 },
  ],
  shoes: [
    { id: 's1', name: 'Nike Vaporfly 3', primary: true, distance: 1240000 },
    { id: 's2', name: 'Hoka Clifton 9', primary: false, distance: 980000 },
  ],
}

// ─── Activity name pools ───────────────────────────────────────────────────────

const RUN_NAMES = [
  'Morning Run', 'Lunch Run', 'Evening Run', 'Easy Miles', 'Tempo Run',
  'Long Run', 'Recovery Run', 'Trail Blast', 'Sunrise Run', 'Track Workout',
  'Fartlek Fun', 'Weekend Long Run', 'Neighborhood Loop', 'Hill Repeats',
  'Shake-Out Run', 'Pre-Race Jog', 'Post-Work Miles', 'Sunday Long Run',
  'Progression Run', 'Golden Gate Loop',
]

const RIDE_NAMES = [
  'Morning Ride', 'Coffee Ride', 'Group Ride', 'Endurance Ride', 'Hill Climb',
  'Century Prep Ride', 'Recovery Spin', 'Coastal Cruise', 'Marin Headlands Loop',
  'Stinson Beach Ride', 'Gravel Grind', 'Evening Spin', 'Mt. Tam Climb',
  'Weekend Warrior Ride', 'Bay Trail Ride', 'Sunset Ride', 'Climbing Day',
  'Interval Ride', 'Base Miles', 'Skyline Blvd Cruise',
]

const SWIM_NAMES = [
  'Morning Swim', 'Lap Swim', 'Pool Session', 'Masters Swim', 'Easy Swim',
  'Technique Work', 'Distance Swim', 'Interval Set', 'Open Water Prep', 'Recovery Swim',
]

const HIKE_NAMES = [
  'Mt. Tamalpais Hike', 'Point Reyes Trail', 'Muir Woods Walk', 'Marin Headlands Hike',
  'Tennessee Valley Hike', 'Angel Island Loop', 'Sweeney Ridge Trail',
  'Lands End Trail', 'Dipsea Trail', 'Alpine Lake Loop',
]

const WEIGHT_NAMES = [
  'Strength Session', 'Gym Workout', 'Upper Body', 'Lower Body',
  'Full Body Lift', 'Core Work', 'Push Day', 'Pull Day', 'Leg Day', 'CrossFit WOD',
]

const VIRTUAL_NAMES = [
  'Zwift Ride', 'Virtual Group Ride', 'Zwift Race', 'Indoor Trainer',
  'Structured Workout', 'Zwift Watopia', 'Recovery Spin', 'FTP Builder',
]

// ─── Generate Activities ───────────────────────────────────────────────────────

function generateActivities(): StravaActivity[] {
  const now = new Date()
  const twoYearsAgo = new Date(now)
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  const activities: StravaActivity[] = []
  let idCounter = 1000000

  const totalDays = Math.floor((now.getTime() - twoYearsAgo.getTime()) / 86400000)

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const date = new Date(twoYearsAgo)
    date.setDate(date.getDate() + dayOffset)

    const dayOfWeek = date.getDay() // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const activityProbability = isWeekend ? 0.80 : 0.55

    if (rng() > activityProbability) continue

    // Pick sport type based on distribution
    const sportRoll = rng()
    let sport_type: string
    if (sportRoll < 0.40) {
      sport_type = 'Run'
    } else if (sportRoll < 0.68) {
      sport_type = 'Ride'
    } else if (sportRoll < 0.78) {
      sport_type = 'Swim'
    } else if (sportRoll < 0.88) {
      sport_type = 'Hike'
    } else if (sportRoll < 0.95) {
      sport_type = 'WeightTraining'
    } else {
      sport_type = 'VirtualRide'
    }

    // Random start hour (5am to 8pm)
    const startHour = randInt(5, 20)
    const startMinute = randInt(0, 59)
    const startSecond = randInt(0, 59)

    const startDate = new Date(date)
    startDate.setHours(startHour, startMinute, startSecond, 0)

    const startDateStr = startDate.toISOString()
    // Strava quirk: start_date_local has Z suffix but is actually local time
    const localDateStr = `${startDate.toISOString().slice(0, 19)}Z`

    let distance: number
    let moving_time: number
    let elapsed_time: number
    let total_elevation_gain: number
    let average_speed: number
    let max_speed: number
    let average_heartrate: number
    let name: string
    let pr_count: number
    let achievement_count: number
    let kudos_count: number

    switch (sport_type) {
      case 'Run': {
        distance = randFloat(4000, 22000)
        const paceSecPerKm = randFloat(250, 360)
        moving_time = Math.round((distance / 1000) * paceSecPerKm)
        elapsed_time = Math.round(moving_time * randFloat(1.02, 1.12))
        total_elevation_gain = randFloat(30, 400)
        average_speed = distance / moving_time
        max_speed = average_speed * randFloat(1.15, 1.40)
        average_heartrate = randFloat(145, 175)
        name = pick(RUN_NAMES)
        pr_count = rng() < 0.15 ? randInt(1, 3) : 0
        achievement_count = rng() < 0.25 ? randInt(1, 8) : 0
        kudos_count = randInt(2, 35)
        break
      }
      case 'Ride': {
        distance = randFloat(20000, 100000)
        const speedMs = randFloat(6, 9)
        moving_time = Math.round(distance / speedMs)
        elapsed_time = Math.round(moving_time * randFloat(1.05, 1.25))
        total_elevation_gain = randFloat(200, 2500)
        average_speed = speedMs
        max_speed = speedMs * randFloat(1.3, 1.7)
        average_heartrate = randFloat(135, 165)
        name = pick(RIDE_NAMES)
        pr_count = rng() < 0.10 ? randInt(1, 5) : 0
        achievement_count = rng() < 0.20 ? randInt(1, 12) : 0
        kudos_count = randInt(3, 42)
        break
      }
      case 'Swim': {
        distance = randFloat(800, 4000)
        const pacePer100m = randFloat(90, 140) // seconds per 100m
        moving_time = Math.round((distance / 100) * pacePer100m)
        elapsed_time = Math.round(moving_time * randFloat(1.05, 1.15))
        total_elevation_gain = 0
        average_speed = distance / moving_time
        max_speed = average_speed * randFloat(1.1, 1.3)
        average_heartrate = randFloat(140, 165)
        name = pick(SWIM_NAMES)
        pr_count = rng() < 0.08 ? randInt(1, 2) : 0
        achievement_count = rng() < 0.15 ? randInt(1, 4) : 0
        kudos_count = randInt(1, 18)
        break
      }
      case 'Hike': {
        distance = randFloat(8000, 20000)
        const hikePaceSecPerKm = randFloat(450, 600)
        moving_time = Math.round((distance / 1000) * hikePaceSecPerKm)
        elapsed_time = Math.round(moving_time * randFloat(1.10, 1.35))
        total_elevation_gain = randFloat(300, 1500)
        average_speed = distance / moving_time
        max_speed = average_speed * randFloat(1.2, 1.5)
        average_heartrate = randFloat(120, 155)
        name = pick(HIKE_NAMES)
        pr_count = 0
        achievement_count = rng() < 0.10 ? randInt(1, 3) : 0
        kudos_count = randInt(2, 22)
        break
      }
      case 'WeightTraining': {
        distance = 0
        moving_time = randInt(2700, 5400)
        elapsed_time = Math.round(moving_time * randFloat(1.05, 1.20))
        total_elevation_gain = 0
        average_speed = 0
        max_speed = 0
        average_heartrate = randFloat(130, 155)
        name = pick(WEIGHT_NAMES)
        pr_count = 0
        achievement_count = 0
        kudos_count = randInt(0, 12)
        break
      }
      case 'VirtualRide': {
        distance = randFloat(20000, 80000)
        const vSpeedMs = randFloat(7, 10)
        moving_time = Math.round(distance / vSpeedMs)
        elapsed_time = Math.round(moving_time * randFloat(1.01, 1.05))
        total_elevation_gain = randFloat(100, 1200)
        average_speed = vSpeedMs
        max_speed = vSpeedMs * randFloat(1.2, 1.5)
        average_heartrate = randFloat(138, 168)
        name = pick(VIRTUAL_NAMES)
        pr_count = rng() < 0.05 ? 1 : 0
        achievement_count = rng() < 0.12 ? randInt(1, 5) : 0
        kudos_count = randInt(1, 20)
        break
      }
      default: {
        continue
      }
    }

    activities.push({
      id: idCounter++,
      name,
      sport_type,
      type: sport_type,
      start_date: startDateStr,
      start_date_local: localDateStr,
      distance: Math.round(distance),
      moving_time: Math.round(moving_time),
      elapsed_time: Math.round(elapsed_time),
      total_elevation_gain: Math.round(total_elevation_gain),
      kudos_count: Math.round(kudos_count),
      athlete_count: 1,
      visibility: 'everyone' as const,
      average_speed: parseFloat(average_speed.toFixed(4)),
      max_speed: parseFloat(max_speed.toFixed(4)),
      average_heartrate: parseFloat(average_heartrate.toFixed(1)),
      pr_count,
      achievement_count,
    })
  }

  // Sort most recent first
  return activities.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
}

export const DEMO_ACTIVITIES: StravaActivity[] = generateActivities()

// ─── Athlete Stats ─────────────────────────────────────────────────────────────

export const DEMO_ATHLETE_STATS: AthleteStats = {
  biggest_ride_distance: 152340,
  biggest_climb_elevation_gain: 2847,
  recent_ride_totals: {
    count: 4,
    distance: 184200,
    moving_time: 23400,
    elapsed_time: 27800,
    elevation_gain: 2840,
  },
  recent_run_totals: {
    count: 6,
    distance: 72100,
    moving_time: 24120,
    elapsed_time: 26500,
    elevation_gain: 680,
  },
  recent_swim_totals: {
    count: 2,
    distance: 4200,
    moving_time: 5040,
    elapsed_time: 5500,
    elevation_gain: 0,
  },
  ytd_ride_totals: {
    count: 52,
    distance: 2_841_000,
    moving_time: 378_000,
    elapsed_time: 441_000,
    elevation_gain: 38_200,
  },
  ytd_run_totals: {
    count: 78,
    distance: 1_024_000,
    moving_time: 338_520,
    elapsed_time: 374_400,
    elevation_gain: 9_420,
  },
  ytd_swim_totals: {
    count: 24,
    distance: 62_400,
    moving_time: 74_880,
    elapsed_time: 82_800,
    elevation_gain: 0,
  },
  all_ride_totals: {
    count: 148,
    distance: 8_420_000,
    moving_time: 1_102_800,
    elapsed_time: 1_296_000,
    elevation_gain: 112_400,
  },
  all_run_totals: {
    count: 214,
    distance: 2_847_000,
    moving_time: 942_000,
    elapsed_time: 1_044_000,
    elevation_gain: 26_200,
  },
  all_swim_totals: {
    count: 68,
    distance: 176_800,
    moving_time: 212_160,
    elapsed_time: 234_000,
    elevation_gain: 0,
  },
}

// ─── Clubs ────────────────────────────────────────────────────────────────────

export const DEMO_CLUBS: StravaClub[] = [
  {
    id: 100001,
    name: 'SF Running Club',
    sport_type: 'running',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    member_count: 1847,
    profile_medium: '',
    description: 'San Francisco\'s friendliest running community. Weekly group runs, races, and social events.',
    url: 'sf-running-club',
  },
  {
    id: 100002,
    name: 'Bay Area Cyclists',
    sport_type: 'cycling',
    city: 'San Francisco',
    state: 'California',
    country: 'USA',
    member_count: 3214,
    profile_medium: '',
    description: 'Group rides across the Bay Area every weekend. All paces welcome.',
    url: 'bay-area-cyclists',
  },
]
