'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'
import { BookOpen, Activity } from 'lucide-react'

const ACTIVITY_MILESTONES: Milestone[] = [
  { name: 'First Footprint', threshold: 1 },
  { name: 'Breaking a Sweat', threshold: 5 },
  { name: 'Warm-Up Complete', threshold: 10 },
  { name: 'Finding Your Stride', threshold: 20 },
  { name: 'Quarter Century Club', threshold: 25 },
  { name: 'Fifty & Flying', threshold: 50 },
  { name: 'Century of Motion', threshold: 100 },
  { name: 'Double Century', threshold: 200 },
  { name: 'Triple Threat', threshold: 300 },
  { name: 'Quad Squad', threshold: 400 },
  { name: 'Five Hundred Strong', threshold: 500 },
  { name: 'The Grind Never Stops', threshold: 750 },
  { name: 'Comma Club', threshold: 1000 },
  { name: 'Momentum Machine', threshold: 2000 },
  { name: 'Endurance Engine', threshold: 3000 },
  { name: 'Relentless Routine', threshold: 4000 },
  { name: 'Five Thousand Strong', threshold: 5000 },
  { name: 'Habit Architect', threshold: 7500 },
  { name: 'Ten-Thousand Club', threshold: 10000 },
  { name: 'Motion Veteran', threshold: 15000 },
  { name: 'Endurance Icon', threshold: 20000 },
  { name: 'Legend in Motion', threshold: 30000 },
  { name: 'Myth of Movement', threshold: 40000 },
  { name: 'Unstoppable Force', threshold: 50000 },
  { name: 'The Marathon of Life', threshold: 75000 },
  { name: 'Living Legend', threshold: 100000 },
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
      HeaderIcon={BookOpen}
      milestones={ACTIVITY_MILESTONES}
      activities={activities}
      getValue={() => 1}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      EmptyIcon={Activity}
      emptyTitle="Get moving!"
      emptyMessage="Log your first activity to start your journey."
    />
  )
}
