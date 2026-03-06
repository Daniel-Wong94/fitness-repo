'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'

const ELEVATION_MILESTONES: Milestone[] = [
  { name: 'Statue of Liberty', threshold: 93, emoji: '🗽' },
  { name: 'Eiffel Tower', threshold: 330, emoji: '🗼' },
  { name: 'Empire State Building', threshold: 443, emoji: '🏙️' },
  { name: 'Burj Khalifa', threshold: 828, emoji: '🏗️' },
  { name: 'Table Mountain', threshold: 1085, emoji: '⛰️' },
  { name: 'Ben Nevis', threshold: 1345, emoji: '🏴' },
  { name: 'Mount Fuji', threshold: 3776, emoji: '🗻' },
  { name: 'Matterhorn', threshold: 4478, emoji: '⛰️' },
  { name: 'Mont Blanc', threshold: 4808, emoji: '🏔️' },
  { name: 'Kilimanjaro', threshold: 5895, emoji: '🌍' },
  { name: 'Aconcagua', threshold: 6961, emoji: '🌎' },
  { name: 'K2', threshold: 8611, emoji: '🏔️' },
  { name: 'Mount Everest', threshold: 8849, emoji: '🏔️' },
  { name: 'Commercial Jet Altitude', threshold: 11000, emoji: '✈️' },
  { name: 'Weather Balloon', threshold: 30000, emoji: '🎈' },
  { name: "Baumgartner's Jump", threshold: 38969, emoji: '🪂' },
  { name: 'Stratosphere', threshold: 50000, emoji: '🌡️' },
  { name: 'Mesosphere', threshold: 80000, emoji: '🌌' },
  { name: 'Kármán Line (Edge of Space)', threshold: 100000, emoji: '🚀' },
  { name: 'Low Earth Orbit', threshold: 200000, emoji: '🛰️' },
  { name: 'International Space Station', threshold: 408000, emoji: '🧑‍🚀' },
  { name: 'Hubble Space Telescope', threshold: 540000, emoji: '🔭' },
  { name: 'Geostationary Orbit', threshold: 35786000, emoji: '📡' },
  { name: 'Halfway to the Moon', threshold: 192200000, emoji: '🌗' },
  { name: 'The Moon', threshold: 384400000, emoji: '🌕' },
  { name: 'One Lunar Round Trip', threshold: 768800000, emoji: '🚀🌕🚀' },
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
      headerEmoji="⛰️"
      milestones={ELEVATION_MILESTONES}
      activities={activities}
      getValue={(a) => a.total_elevation_gain}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      emptyIcon="🧗"
      emptyTitle="Keep climbing!"
      emptyMessage="Log some elevation to unlock your first milestone."
    />
  )
}
