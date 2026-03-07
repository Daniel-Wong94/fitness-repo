import { StravaActivity } from './types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PR_MAGNET_MIN = 10
const KUDOS_SPONGE_MIN = 25
const CHATTY_CATHY_MIN = 10
const WEEKEND_RITUAL_MIN = 20
const TURTLE_PACE_SEC_PER_KM = 9 * 60 + 20   // 9:20/km
const TURTLE_MIN_DISTANCE_M = 1609
const ALL_GAS_RATIO = 0.95
const ALL_GAS_MIN_ELAPSED = 20 * 60
const PHANTOM_MIN_DISTANCE_M = 1609
const OVERDRESSER_MIN_ELAPSED = 20 * 60

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Trophy {
  id: string
  name: string
  description: string
  earned: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Parse components directly from the string — avoids timezone shifts from the
// misleading Z suffix that Strava appends to start_date_local values.
function localHour(dateStr: string): number {
  return parseInt(dateStr.slice(11, 13), 10)
}

function localDate(dateStr: string): string {
  return dateStr.slice(0, 10)
}

function localDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d).getDay() // 0=Sun, 6=Sat
}

// ─── computeTrophies ──────────────────────────────────────────────────────────

function log(trophy: string, match: object | string) {
  console.log(`[trophy] ${trophy}:`, match)
}

export function computeTrophies(activities: StravaActivity[]): Trophy[] {
  // Night Owl: any activity starting between 00:00–03:59
  const nightOwlMatch = activities.find((a) => {
    const h = localHour(a.start_date_local)
    return h >= 0 && h <= 3
  })
  if (nightOwlMatch) log('Night Owl', { id: nightOwlMatch.id, name: nightOwlMatch.name, start_date_local: nightOwlMatch.start_date_local })

  // Early Bird: any activity starting between 05:00–05:59
  const earlyBirdMatch = activities.find((a) => localHour(a.start_date_local) === 5)
  if (earlyBirdMatch) log('Early Bird', { id: earlyBirdMatch.id, name: earlyBirdMatch.name, start_date_local: earlyBirdMatch.start_date_local })

  // Lunch Break Warrior: any activity starting at 12:xx
  const lunchBreakMatch = activities.find((a) => localHour(a.start_date_local) === 12)
  if (lunchBreakMatch) log('Lunch Break Warrior', { id: lunchBreakMatch.id, name: lunchBreakMatch.name, start_date_local: lunchBreakMatch.start_date_local })

  // Midnight Runner: activity ends on a different calendar date than it started
  const midnightRunnerMatch = activities.find((a) => {
    const h = parseInt(a.start_date_local.slice(11, 13), 10)
    const m = parseInt(a.start_date_local.slice(14, 16), 10)
    const s = parseInt(a.start_date_local.slice(17, 19), 10)
    return h * 3600 + m * 60 + s + a.elapsed_time >= 86400
  })
  if (midnightRunnerMatch) log('Midnight Runner', { id: midnightRunnerMatch.id, name: midnightRunnerMatch.name, start_date_local: midnightRunnerMatch.start_date_local, elapsed_time: midnightRunnerMatch.elapsed_time })

  // Elevation Hoarder: total_elevation_gain > distance (both meters)
  const elevationHoarderMatch = activities.find(
    (a) => a.distance > 0 && a.total_elevation_gain > a.distance
  )
  if (elevationHoarderMatch) log('Elevation Hoarder', { id: elevationHoarderMatch.id, name: elevationHoarderMatch.name, distance: elevationHoarderMatch.distance, total_elevation_gain: elevationHoarderMatch.total_elevation_gain })

  // Marathon That Wasn't: distance in [41842, 42195) meters
  const marathonThatWasntMatch = activities.find(
    (a) => a.distance >= 41842 && a.distance < 42195 && a.sport_type === 'Run'
  )
  if (marathonThatWasntMatch) log("Marathon That Wasn't", { id: marathonThatWasntMatch.id, name: marathonThatWasntMatch.name, distance_m: marathonThatWasntMatch.distance, distance_mi: (marathonThatWasntMatch.distance / 1609.34).toFixed(2) })

  // Perfectly Average: always earned — find activity closest to lifetime avg pace
  const validPace = activities.filter((a) => a.distance > 0 && a.moving_time > 0)
  const totalDist = validPace.reduce((s, a) => s + a.distance, 0)
  const totalTime = validPace.reduce((s, a) => s + a.moving_time, 0)
  const avgPace = totalDist > 0 ? totalTime / totalDist : 0
  const perfectlyAverageMatch = validPace.reduce<StravaActivity | null>((best, a) => {
    const pace = a.moving_time / a.distance
    if (!best) return a
    return Math.abs(pace - avgPace) < Math.abs(best.moving_time / best.distance - avgPace) ? a : best
  }, null)
  if (perfectlyAverageMatch) log('Perfectly Average', { id: perfectlyAverageMatch.id, name: perfectlyAverageMatch.name, pace_sec_per_km: (perfectlyAverageMatch.moving_time / perfectlyAverageMatch.distance * 1000).toFixed(1), avg_pace_sec_per_km: (avgPace * 1000).toFixed(1) })

  // Turtle Mode: distance >= 1 mile AND pace > 9:20/km
  const turtleModeMatch = activities.find(
    (a) =>
      a.distance >= TURTLE_MIN_DISTANCE_M &&
      a.moving_time > 0 &&
      a.moving_time / a.distance > TURTLE_PACE_SEC_PER_KM / 1000
  )
  if (turtleModeMatch) log('Turtle Mode', { id: turtleModeMatch.id, name: turtleModeMatch.name, pace_sec_per_km: (turtleModeMatch.moving_time / turtleModeMatch.distance * 1000).toFixed(1), distance_m: turtleModeMatch.distance })

  // One Meter Club: ±0.01 mi of exactly 1 mile OR ±0.01 km of exactly 1 km
  const oneMeterClubMatch = activities.find(
    (a) =>
      Math.abs(a.distance - 1609.34) <= 16 ||
      Math.abs(a.distance - 1000) <= 10
  )
  if (oneMeterClubMatch) log('One Meter Club', { id: oneMeterClubMatch.id, name: oneMeterClubMatch.name, distance_m: oneMeterClubMatch.distance })

  // Speed Demon: Ride/VirtualRide AND average_speed > 13.41 m/s (30 mph)
  const speedDemonMatch = activities.find(
    (a) =>
      (a.sport_type === 'Ride' || a.sport_type === 'VirtualRide') &&
      a.average_speed > 13.41
  )
  if (speedDemonMatch) log('Speed Demon', { id: speedDemonMatch.id, name: speedDemonMatch.name, average_speed_ms: speedDemonMatch.average_speed, average_speed_mph: (speedDemonMatch.average_speed * 2.237).toFixed(1) })

  // Century Tease: Ride/VirtualRide AND distance in [159327, 160934) meters (99–100 miles)
  const centuryTeaseMatch = activities.find(
    (a) =>
      (a.sport_type === 'Ride' || a.sport_type === 'VirtualRide') &&
      a.distance >= 159327 &&
      a.distance < 160934
  )
  if (centuryTeaseMatch) log('Century Tease', { id: centuryTeaseMatch.id, name: centuryTeaseMatch.name, distance_mi: (centuryTeaseMatch.distance / 1609.34).toFixed(2) })

  // Bare Minimum: distance > 0 AND distance < 804 meters
  const bareMinimumMatch = activities.find(
    (a) => a.distance > 0 && a.distance < 804
  )
  if (bareMinimumMatch) log('Bare Minimum', { id: bareMinimumMatch.id, name: bareMinimumMatch.name, distance_m: bareMinimumMatch.distance })

  // PR Magnet: any activity with achievement_count >= 10
  const prMagnetMatch = activities.find(
    (a) => (a.achievement_count ?? 0) >= PR_MAGNET_MIN
  )
  if (prMagnetMatch) log('PR Magnet', { id: prMagnetMatch.id, name: prMagnetMatch.name, achievement_count: prMagnetMatch.achievement_count })

  // Kudos Sponge: any activity with kudos_count >= 25
  const kudosSpongeMatch = activities.find(
    (a) => a.kudos_count >= KUDOS_SPONGE_MIN
  )
  if (kudosSpongeMatch) log('Kudos Sponge', { id: kudosSpongeMatch.id, name: kudosSpongeMatch.name, kudos_count: kudosSpongeMatch.kudos_count })

  // Chatty Cathy's Workout: any activity with comment_count >= 10
  const chattyCathyMatch = activities.find(
    (a) => (a.comment_count ?? 0) >= CHATTY_CATHY_MIN
  )
  if (chattyCathyMatch) log("Chatty Cathy's Workout", { id: chattyCathyMatch.id, name: chattyCathyMatch.name, comment_count: chattyCathyMatch.comment_count })

  // Commute Goblin: any activity with commute === true
  const commuteGoblinMatch = activities.find((a) => a.commute === true)
  if (commuteGoblinMatch) log('Commute Goblin', { id: commuteGoblinMatch.id, name: commuteGoblinMatch.name, commute: commuteGoblinMatch.commute })

  // Indoor Kid: any activity with trainer === true
  const indoorKidMatch = activities.find((a) => a.trainer === true)
  if (indoorKidMatch) log('Indoor Kid', { id: indoorKidMatch.id, name: indoorKidMatch.name, trainer: indoorKidMatch.trainer })

  // All Gas No Brakes: elapsed >= 20min AND moving/elapsed >= 0.95
  const allGasNoBrakesMatch = activities.find(
    (a) =>
      a.elapsed_time >= ALL_GAS_MIN_ELAPSED &&
      a.elapsed_time > 0 &&
      a.moving_time / a.elapsed_time >= ALL_GAS_RATIO
  )
  if (allGasNoBrakesMatch) log('All Gas No Brakes', { id: allGasNoBrakesMatch.id, name: allGasNoBrakesMatch.name, moving_time: allGasNoBrakesMatch.moving_time, elapsed_time: allGasNoBrakesMatch.elapsed_time, ratio: (allGasNoBrakesMatch.moving_time / allGasNoBrakesMatch.elapsed_time).toFixed(3) })

  // Weekend Ritual: >= 20 activities on Sat/Sun
  const weekendActivities = activities.filter((a) => {
    const d = localDayOfWeek(a.start_date_local)
    return d === 0 || d === 6
  })
  const weekendCount = weekendActivities.length
  if (weekendCount >= WEEKEND_RITUAL_MIN) log('Weekend Ritual', { total_weekend_activities: weekendCount })

  // The Phantom: kudos_count === 0 AND distance >= 1 mile
  const thePhantomMatch = activities.find(
    (a) => a.kudos_count === 0 && a.distance >= PHANTOM_MIN_DISTANCE_M
  )
  if (thePhantomMatch) log('The Phantom', { id: thePhantomMatch.id, name: thePhantomMatch.name, kudos_count: thePhantomMatch.kudos_count, distance_m: thePhantomMatch.distance })

  // Overdresser: elapsed >= 20min AND elapsed >= 2 * moving
  const overdresserMatch = activities.find(
    (a) =>
      a.elapsed_time >= OVERDRESSER_MIN_ELAPSED &&
      a.elapsed_time >= 2 * a.moving_time
  )
  if (overdresserMatch) log('Overdresser', { id: overdresserMatch.id, name: overdresserMatch.name, moving_time: overdresserMatch.moving_time, elapsed_time: overdresserMatch.elapsed_time })

  // Accidental Triathlete: any calendar day with Swim + (Ride/VirtualRide) + (Run/VirtualRun)
  const byDate = new Map<string, Set<string>>()
  for (const a of activities) {
    const d = localDate(a.start_date_local)
    if (!byDate.has(d)) byDate.set(d, new Set())
    byDate.get(d)!.add(a.sport_type)
  }
  let accidentalTriathleteDate: string | null = null
  for (const [date, types] of Array.from(byDate.entries())) {
    if (types.has('Swim') && (types.has('Ride') || types.has('VirtualRide')) && (types.has('Run') || types.has('VirtualRun'))) {
      accidentalTriathleteDate = date
      break
    }
  }
  if (accidentalTriathleteDate) log('Accidental Triathlete', { date: accidentalTriathleteDate, sport_types: Array.from(byDate.get(accidentalTriathleteDate)!) })

  // Derived booleans
  const nightOwl = !!nightOwlMatch
  const earlyBird = !!earlyBirdMatch
  const lunchBreak = !!lunchBreakMatch
  const midnightRunner = !!midnightRunnerMatch
  const elevationHoarder = !!elevationHoarderMatch
  const marathonThatWasnt = !!marathonThatWasntMatch
  const perfectlyAverage = true
  const turtleMode = !!turtleModeMatch
  const oneMeterClub = !!oneMeterClubMatch
  const speedDemon = !!speedDemonMatch
  const centuryTease = !!centuryTeaseMatch
  const bareMinimum = !!bareMinimumMatch
  const prMagnet = !!prMagnetMatch
  const kudosSponge = !!kudosSpongeMatch
  const chattyCathy = !!chattyCathyMatch
  const commuteGoblin = !!commuteGoblinMatch
  const indoorKid = !!indoorKidMatch
  const allGasNoBrakes = !!allGasNoBrakesMatch
  const weekendRitual = weekendCount >= WEEKEND_RITUAL_MIN
  const thePhantom = !!thePhantomMatch
  const overdresser = !!overdresserMatch
  const accidentalTriathlete = !!accidentalTriathleteDate

  return [
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Started an activity between midnight and 3:59 AM',
      earned: nightOwl,
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Started an activity between 5:00 and 5:59 AM',
      earned: earlyBird,
    },
    {
      id: 'lunch_break',
      name: 'Lunch Break Warrior',
      description: 'Started an activity during the noon hour',
      earned: lunchBreak,
    },
    {
      id: 'midnight_runner',
      name: 'Midnight Runner',
      description: 'Finished an activity after midnight (crossed calendar day)',
      earned: midnightRunner,
    },
    {
      id: 'elevation_hoarder',
      name: 'Elevation Hoarder',
      description: 'Climbed more meters than you traveled in distance',
      earned: elevationHoarder,
    },
    {
      id: 'marathon_that_wasnt',
      name: 'Marathon That Wasn\'t',
      description: 'Ran just shy of a marathon (26.0–26.19 miles)',
      earned: marathonThatWasnt,
    },
    {
      id: 'perfectly_average',
      name: 'Perfectly Average',
      description: 'Had one activity that matched your lifetime average pace exactly',
      earned: perfectlyAverage,
    },
    {
      id: 'turtle_mode',
      name: 'Turtle Mode',
      description: 'Completed at least 1 mile at a pace slower than 9:20/km (15:00/mi)',
      earned: turtleMode,
    },
    {
      id: 'one_meter_club',
      name: 'One Meter Club',
      description: 'Ran almost exactly 1 mile or 1 km (within 1%)',
      earned: oneMeterClub,
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Rode faster than 30 mph (48 km/h) average on a bike',
      earned: speedDemon,
    },
    {
      id: 'century_tease',
      name: 'Century Tease',
      description: 'Rode 99–100 miles on a bike without quite hitting the century',
      earned: centuryTease,
    },
    {
      id: 'bare_minimum',
      name: 'Bare Minimum',
      description: 'Logged an activity under 0.5 miles (0.8 km)',
      earned: bareMinimum,
    },
    {
      id: 'pr_magnet',
      name: 'PR Magnet',
      description: `Earned ${PR_MAGNET_MIN}+ achievements in a single activity`,
      earned: prMagnet,
    },
    {
      id: 'kudos_sponge',
      name: 'Kudos Sponge',
      description: `Got ${KUDOS_SPONGE_MIN}+ kudos on a single activity`,
      earned: kudosSponge,
    },
    {
      id: 'chatty_cathy',
      name: "Chatty Cathy's Workout",
      description: `Had ${CHATTY_CATHY_MIN}+ comments on a single activity`,
      earned: chattyCathy,
    },
    {
      id: 'commute_goblin',
      name: 'Commute Goblin',
      description: 'Logged at least one commute activity',
      earned: commuteGoblin,
    },
    {
      id: 'indoor_kid',
      name: 'Indoor Kid',
      description: 'Completed at least one activity on a trainer or treadmill',
      earned: indoorKid,
    },
    {
      id: 'all_gas_no_brakes',
      name: 'All Gas No Brakes',
      description: 'Spent 95%+ of elapsed time actually moving (20+ min activity)',
      earned: allGasNoBrakes,
    },
    {
      id: 'weekend_ritual',
      name: 'Weekend Ritual',
      description: `Completed ${WEEKEND_RITUAL_MIN}+ activities on weekends`,
      earned: weekendRitual,
    },
    {
      id: 'the_phantom',
      name: 'The Phantom',
      description: 'Logged a 1+ mile activity that got zero kudos',
      earned: thePhantom,
    },
    {
      id: 'overdresser',
      name: 'Overdresser',
      description: 'Spent more than twice as long stopped as moving (20+ min activity)',
      earned: overdresser,
    },
    {
      id: 'accidental_triathlete',
      name: 'Accidental Triathlete',
      description: 'Swam, biked, and ran all in the same calendar day',
      earned: accidentalTriathlete,
    },
  ]
}
