'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'
import { Mountain, TrendingUp } from 'lucide-react'

const ELEVATION_MILESTONES: Milestone[] = [
  { name: 'Statue of Liberty', threshold: 93 },
  { name: 'Eiffel Tower', threshold: 330 },
  { name: 'Empire State Building', threshold: 443 },
  { name: 'Burj Khalifa', threshold: 828 },
  { name: 'Table Mountain', threshold: 1085 },
  { name: 'Ben Nevis', threshold: 1345 },
  { name: 'Mount Fuji', threshold: 3776 },
  { name: 'Matterhorn', threshold: 4478 },
  { name: 'Mont Blanc', threshold: 4808 },
  { name: 'Kilimanjaro', threshold: 5895 },
  { name: 'Aconcagua', threshold: 6961 },
  { name: 'K2', threshold: 8611 },
  { name: 'Mount Everest', threshold: 8849 },
  { name: 'Commercial Jet Altitude', threshold: 11000 },
  { name: 'Weather Balloon', threshold: 30000 },
  { name: "Baumgartner's Jump", threshold: 38969 },
  { name: 'Stratosphere', threshold: 50000 },
  { name: 'Mesosphere', threshold: 80000 },
  { name: 'Karman Line (Edge of Space)', threshold: 100000 },
  { name: 'Low Earth Orbit', threshold: 200000 },
  { name: 'International Space Station', threshold: 408000 },
  { name: 'Hubble Space Telescope', threshold: 540000 },
  { name: 'Geostationary Orbit', threshold: 35786000 },
  { name: 'Halfway to the Moon', threshold: 192200000 },
  { name: 'The Moon', threshold: 384400000 },
  { name: 'One Lunar Round Trip', threshold: 768800000 },
]

function formatDisplay(val: number, imperial: boolean) {
  return imperial
    ? `${Math.round(val * 3.28084).toLocaleString()} ft`
    : `${Math.round(val).toLocaleString()} m`
}

function formatThreshold(val: number, imperial: boolean) {
  return imperial
    ? `${Math.round(val * 3.28084).toLocaleString()} ft`
    : `${val.toLocaleString()} m`
}

function formatY(val: number, imperial: boolean) {
  if (imperial) return `${(val * 3.28084 / 5280).toFixed(1)}mi`
  return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`
}

interface ElevationModalProps {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

export function ElevationModal({ isOpen, onClose, activities }: ElevationModalProps) {
  return (
    <MilestoneModal
      isOpen={isOpen}
      onClose={onClose}
      title="Elevation Journey"
      HeaderIcon={Mountain}
      milestones={ELEVATION_MILESTONES}
      activities={activities}
      getValue={(a) => a.total_elevation_gain}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      EmptyIcon={TrendingUp}
      emptyTitle="Keep climbing!"
      emptyMessage="Log some elevation to unlock your first milestone."
    />
  )
}
