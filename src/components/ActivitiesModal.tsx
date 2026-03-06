'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'

const ACTIVITY_MILESTONES: Milestone[] = [
  { name: 'First Footprint', threshold: 1, emoji: '👣' },
  { name: 'Breaking a Sweat', threshold: 5, emoji: '💦' },
  { name: 'Warm-Up Complete', threshold: 10, emoji: '🔥' },
  { name: 'Finding Your Stride', threshold: 20, emoji: '🏃' },

  { name: 'Quarter Century Club', threshold: 25, emoji: '🏅' },
  { name: 'Fifty & Flying', threshold: 50, emoji: '💨' },
  { name: 'Century of Motion', threshold: 100, emoji: '💯' },

  { name: 'Double Century', threshold: 200, emoji: '⚡' },
  { name: 'Triple Threat', threshold: 300, emoji: '🏃‍♂️' },
  { name: 'Quad Squad', threshold: 400, emoji: '🏋️' },
  { name: 'Five Hundred Strong', threshold: 500, emoji: '🔥' },

  { name: 'The Grind Never Stops', threshold: 750, emoji: '⚙️' },
  { name: 'Comma Club', threshold: 1000, emoji: '🏆' },

  { name: 'Momentum Machine', threshold: 2000, emoji: '🚴' },
  { name: 'Endurance Engine', threshold: 3000, emoji: '🔋' },
  { name: 'Relentless Routine', threshold: 4000, emoji: '🧭' },
  { name: 'Five Thousand Strong', threshold: 5000, emoji: '🌟' },

  { name: 'Habit Architect', threshold: 7500, emoji: '🏗️' },
  { name: 'Ten-Thousand Club', threshold: 10000, emoji: '👑' },
  { name: 'Motion Veteran', threshold: 15000, emoji: '🎖️' },
  { name: 'Endurance Icon', threshold: 20000, emoji: '🏔️' },
  { name: 'Legend in Motion', threshold: 30000, emoji: '🌍' },
  { name: 'Myth of Movement', threshold: 40000, emoji: '⚡' },
  { name: 'Unstoppable Force', threshold: 50000, emoji: '🚀' },
  { name: 'The Marathon of Life', threshold: 75000, emoji: '🌀' },
  { name: 'Living Legend', threshold: 100000, emoji: '👑✨' },
]

function fmt(val: number) {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return `${Math.round(val)}`
}

function formatDisplay(val: number, _imperial: boolean) {
  return `${Math.round(val).toLocaleString()} activities`
}

function formatThreshold(val: number, _imperial: boolean) {
  return `${val.toLocaleString()} activities`
}

function formatY(val: number, _imperial: boolean) {
  return fmt(val)
}

interface ActivitiesModalProps {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

export function ActivitiesModal({ isOpen, onClose, activities }: ActivitiesModalProps) {
  return (
    <MilestoneModal
      isOpen={isOpen}
      onClose={onClose}
      title="Activities Journey"
      headerEmoji="🏃"
      milestones={ACTIVITY_MILESTONES}
      activities={activities}
      getValue={() => 1}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      emptyIcon="🎽"
      emptyTitle="Get moving!"
      emptyMessage="Log your first activity to start your journey."
    />
  )
}
