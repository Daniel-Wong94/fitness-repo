'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'
import { Timer, Clock } from 'lucide-react'

const TIME_MILESTONES: Milestone[] = [
  { name: 'First Hour', threshold: 3600 },
  { name: 'Half Day', threshold: 43200 },
  { name: 'Full Day', threshold: 86400 },
  { name: 'Two Days Moving', threshold: 172800 },
  { name: 'Three Days Moving', threshold: 259200 },
  { name: 'One Week of Motion', threshold: 604800 },
  { name: 'Two Weeks Moving', threshold: 1209600 },
  { name: 'One Month of Activity', threshold: 2592000 },
  { name: 'Two Months of Activity', threshold: 5184000 },
  { name: '1000 Hours', threshold: 3600000 },
  { name: 'Three Months Moving', threshold: 7776000 },
  { name: 'Half Year of Motion', threshold: 15768000 },
  { name: 'One Year of Activity', threshold: 31536000 },
  { name: '500 Days Moving', threshold: 43200000 },
  { name: 'Two Years of Activity', threshold: 63072000 },
  { name: '1000 Days Moving', threshold: 86400000 },
  { name: 'Three Years of Activity', threshold: 94608000 },
  { name: 'Five Years of Motion', threshold: 157680000 },
  { name: 'Ten Years of Movement', threshold: 315360000 },
  { name: 'Lifetime of Motion', threshold: 630720000 },
  { name: 'Legend of Endurance', threshold: 946080000 },
  { name: 'Master of Motion', threshold: 1261440000 },
  { name: 'Time Traveler', threshold: 1576800000 },
  { name: 'Eternal Athlete', threshold: 1892160000 },
  { name: 'Myth of Movement', threshold: 2522880000 },
  { name: 'God of Endurance', threshold: 3153600000 },
]

function fmtSeconds(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDisplay(val: number, _imperial: boolean) {
  const days = Math.floor(val / 86400)
  const hours = Math.floor((val % 86400) / 3600)
  const mins = Math.floor((val % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  return fmtSeconds(val)
}

function formatThreshold(val: number, _imperial: boolean) {
  const days = Math.floor(val / 86400)
  const hours = Math.floor((val % 86400) / 3600)
  if (days >= 365) {
    const yrs = Math.floor(days / 365)
    return yrs === 1 ? '1 year' : `${yrs} years`
  }
  if (days >= 30) {
    const mo = Math.floor(days / 30)
    return mo === 1 ? '1 month' : `${mo} months`
  }
  if (days >= 7) {
    const wk = Math.floor(days / 7)
    return wk === 1 ? '1 week' : `${wk} weeks`
  }
  if (days > 0) return `${days}d`
  return `${hours}h`
}

function formatY(val: number, _imperial: boolean) {
  const days = val / 86400
  if (days >= 365) return `${(days / 365).toFixed(0)}y`
  if (days >= 1) return `${Math.round(days)}d`
  return `${Math.round(val / 3600)}h`
}

interface TimeModalProps {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

export function TimeModal({ isOpen, onClose, activities }: TimeModalProps) {
  return (
    <MilestoneModal
      isOpen={isOpen}
      onClose={onClose}
      title="Time Journey"
      HeaderIcon={Timer}
      milestones={TIME_MILESTONES}
      activities={activities}
      getValue={(a) => a.moving_time}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      EmptyIcon={Clock}
      emptyTitle="Start the clock!"
      emptyMessage="Log some activities to unlock your first time milestone."
    />
  )
}
