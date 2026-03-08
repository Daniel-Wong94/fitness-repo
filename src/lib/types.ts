export interface AthleteGear {
  id: string
  name: string
  primary: boolean
  distance: number
}

export interface StravaAthlete {
  id: number
  firstname: string
  lastname: string
  city: string
  state: string
  country: string
  profile: string
  profile_medium: string
  premium: boolean
  bio?: string
  follower_count?: number
  friend_count?: number
  created_at?: string
  bikes?: AthleteGear[]
  shoes?: AthleteGear[]
}

export interface StravaActivity {
  id: number
  name: string
  sport_type: string
  type: string
  start_date: string
  start_date_local: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  kudos_count: number
  athlete_count: number
  visibility: 'everyone' | 'followers_only' | 'only_me'
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  suffer_score?: number
  pr_count?: number
  achievement_count?: number
  gear_id?: string
  workout_type?: number
  total_photo_count?: number
  commute?: boolean
  trainer?: boolean
  comment_count?: number
}

export interface StravaClub {
  id: number
  name: string
  sport_type: string
  city: string
  state: string
  country: string
  member_count: number
  profile_medium: string
  description?: string
  cover_photo?: string
  profile?: string
  url?: string
}

export interface ClubActivity {
  athlete: { firstname: string; lastname: string }
  name: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
}

export interface ClubMember {
  firstname: string
  lastname: string
  profile_medium: string
  profile: string
}

export interface SessionData {
  access_token?: string
  refresh_token?: string
  expires_at?: number
  athlete?: StravaAthlete
}

export interface Split {
  distance: number
  elapsed_time: number
  moving_time: number
  elevation_difference: number
  average_speed: number
  average_heartrate?: number
  split: number
}

export interface Lap {
  id: number
  name: string
  lap_index: number
  distance: number
  elapsed_time: number
  moving_time: number
  total_elevation_gain: number
  average_speed: number
  max_speed: number
  average_heartrate?: number
}

export interface Gear {
  id: string
  name: string
  distance: number
}

export interface ActivityPhoto {
  count: number
  primary?: { urls: { '600'?: string } }
}

export interface ActivityPhotoItem {
  unique_id: string
  urls: { '600'?: string }
}

export interface DetailedActivity extends StravaActivity {
  map: { summary_polyline: string }
  splits_metric?: Split[]
  splits_imperial?: Split[]
  laps?: Lap[]
  calories?: number
  description?: string
  device_name?: string
  gear?: Gear
  photos?: ActivityPhoto
}

export interface StravaComment {
  id: number
  text: string
  created_at: string
  athlete: {
    id: number
    firstname: string
    lastname: string
    profile_medium: string
  }
}

export interface ActivityTotals {
  count: number
  distance: number
  moving_time: number
  elapsed_time: number
  elevation_gain: number
  achievement_count?: number
}

export interface AthleteStats {
  biggest_ride_distance: number
  biggest_climb_elevation_gain: number
  recent_ride_totals: ActivityTotals
  recent_run_totals: ActivityTotals
  recent_swim_totals: ActivityTotals
  ytd_ride_totals: ActivityTotals
  ytd_run_totals: ActivityTotals
  ytd_swim_totals: ActivityTotals
  all_ride_totals: ActivityTotals
  all_run_totals: ActivityTotals
  all_swim_totals: ActivityTotals
}

export interface SportStats {
  sport_type: string
  count: number
  total_distance: number
  total_time: number
  total_elevation: number
  total_kudos: number
}
