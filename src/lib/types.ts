export interface StravaAthlete {
  id: number
  username: string
  firstname: string
  lastname: string
  city: string
  state: string
  country: string
  profile: string
  profile_medium: string
  follower_count?: number
  friend_count?: number
  created_at?: string
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
}

export interface SessionData {
  access_token?: string
  refresh_token?: string
  expires_at?: number
  athlete?: StravaAthlete
}

export interface SportStats {
  sport_type: string
  count: number
  total_distance: number
  total_time: number
  total_elevation: number
  total_kudos: number
}
