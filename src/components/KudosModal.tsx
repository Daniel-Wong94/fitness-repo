'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'
import { Star, Users } from 'lucide-react'

const KUDOS_MILESTONES: Milestone[] = [
  { name: 'First Cheer', threshold: 1 },
  { name: 'High Five', threshold: 5 },
  { name: 'Getting Noticed', threshold: 10 },
  { name: 'Group Cheer', threshold: 25 },
  { name: 'Standing Ovation', threshold: 50 },
  { name: 'Mini Crowd', threshold: 100 },
  { name: 'Town Hall', threshold: 250 },
  { name: 'Village Gathering', threshold: 500 },
  { name: 'Small Stadium', threshold: 1000 },
  { name: 'Packed Arena', threshold: 2500 },
  { name: 'Rock Concert', threshold: 5000 },
  { name: 'Festival Crowd', threshold: 10000 },
  { name: 'City Square', threshold: 25000 },
  { name: 'Major Stadium', threshold: 50000 },
  { name: 'World Cup Crowd', threshold: 100000 },
  { name: 'Half Million Hype', threshold: 500000 },
  { name: 'Million Cheers', threshold: 1000000 },
  { name: 'Internet Famous', threshold: 2500000 },
  { name: 'Global Applause', threshold: 5000000 },
  { name: 'Legendary Athlete', threshold: 10000000 },
  { name: 'Hall of Fame', threshold: 25000000 },
  { name: 'Sporting Icon', threshold: 50000000 },
  { name: 'World Legend', threshold: 100000000 },
  { name: 'Mythic Status', threshold: 250000000 },
  { name: 'Immortal Athlete', threshold: 500000000 },
  { name: 'Infinite Applause', threshold: 1000000000 },
]

function fmt(val: number) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
  return `${Math.round(val)}`
}

function formatDisplay(val: number, _imperial: boolean) {
  return `${Math.round(val).toLocaleString()} kudos`
}

function formatThreshold(val: number, _imperial: boolean) {
  return `${val.toLocaleString()} kudos`
}

function formatY(val: number, _imperial: boolean) {
  return fmt(val)
}

interface KudosModalProps {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

export function KudosModal({ isOpen, onClose, activities }: KudosModalProps) {
  return (
    <MilestoneModal
      isOpen={isOpen}
      onClose={onClose}
      title="Kudos Journey"
      HeaderIcon={Star}
      milestones={KUDOS_MILESTONES}
      activities={activities}
      getValue={(a) => a.kudos_count || 0}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      EmptyIcon={Users}
      emptyTitle="Share your efforts!"
      emptyMessage="Log public activities to start earning kudos."
    />
  )
}
