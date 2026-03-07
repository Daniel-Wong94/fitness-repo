import {
  Activity,
  Bike,
  Footprints,
  Dumbbell,
  Mountain,
  Waves,
  Zap,
  Wind,
  Snowflake,
  Monitor,
  Sailboat,
  Flag,
  TrendingUp,
  Heart,
  Accessibility,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const SPORT_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Run: Footprints,
  TrailRun: Footprints,
  VirtualRun: Monitor,
  Walk: Footprints,
  Hike: Mountain,
  Ride: Bike,
  MountainBikeRide: Bike,
  GravelRide: Bike,
  VirtualRide: Monitor,
  EBikeRide: Zap,
  Swim: Waves,
  AlpineSki: Snowflake,
  BackcountrySki: Snowflake,
  NordicSki: Snowflake,
  RollerSki: Snowflake,
  Snowboard: Snowflake,
  Snowshoe: Snowflake,
  IceSkate: Snowflake,
  Kayaking: Sailboat,
  Canoeing: Sailboat,
  Rowing: Sailboat,
  StandUpPaddling: Waves,
  Surfing: Waves,
  Kitesurf: Wind,
  Windsurf: Wind,
  WeightTraining: Dumbbell,
  Workout: Dumbbell,
  Crossfit: Dumbbell,
  Elliptical: Activity,
  InlineSkate: Activity,
  Yoga: Heart,
  Golf: Flag,
  Soccer: Activity,
  RockClimbing: Mountain,
  StairStepper: TrendingUp,
  Wheelchair: Accessibility,
}

interface Props extends LucideProps {
  sport: string
}

export function SportIcon({ sport, ...props }: Props) {
  const Icon = SPORT_ICONS[sport] ?? Activity
  return <Icon {...props} />
}
