'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'

const DISTANCE_MILESTONES: Milestone[] = [
  { name: 'First Mile', threshold: 1609, emoji: '👟' },
  { name: '5K', threshold: 5000, emoji: '🏃' },
  { name: '10K', threshold: 10000, emoji: '🎽' },
  { name: 'Half Marathon', threshold: 21097, emoji: '🥈' },
  { name: 'Marathon', threshold: 42195, emoji: '🥇' },

  { name: 'Ultra Initiate', threshold: 80467, emoji: '🔥' }, // 50 mi
  { name: 'Century Walker', threshold: 160934, emoji: '💯' }, // 100 mi
  { name: 'Cross England', threshold: 300000, emoji: '🇬🇧' },
  { name: 'Road Song', threshold: 804672, emoji: '🎵' }, // 500 mi

  { name: 'Trailblazer', threshold: 1500000, emoji: '🗾' },
  { name: 'Four-Digit Club', threshold: 1609344, emoji: '🧭' }, // 1000 mi

  { name: 'Endurance Engine', threshold: 3218688, emoji: '🚴' }, // 2000 mi
  { name: 'Outback Crossing', threshold: 4000000, emoji: '🇦🇺' },
  { name: 'Coast Runner', threshold: 4500000, emoji: '🇺🇸' },

  { name: 'Atlantic Drifter', threshold: 5600000, emoji: '🌊' },
  { name: 'Earthbound (earth radius)', threshold: 6371000, emoji: '🌍' },
  { name: 'Pacific Voyager', threshold: 10000000, emoji: '🌊' },
  { name: 'Worldsplitter (earth diameter)', threshold: 12742000, emoji: '🌎' },

  { name: 'Horizon Chaser (halfway around earth)', threshold: 20037500, emoji: '🌏' },
  { name: 'Globe Trotter (around the earth)', threshold: 40075000, emoji: '🌐' },

  { name: 'Continental Drift', threshold: 60112500, emoji: '🧳' },
  { name: 'Planet Walker', threshold: 80150000, emoji: '🪐' },
  { name: 'World Weaver', threshold: 120225000, emoji: '🕸️' },
  { name: 'Orbit Dreamer', threshold: 160300000, emoji: '🚀' },
  { name: 'Earth Archivist', threshold: 200375000, emoji: '📜' },
  { name: 'Legend of Distance', threshold: 400750000, emoji: '👑' },
]

function formatDisplay(val: number, imperial: boolean) {
  if (imperial) return `${(val / 1609.344).toFixed(1)} mi`
  return `${(val / 1000).toFixed(1)} km`
}

function formatThreshold(val: number, imperial: boolean) {
  if (imperial) {
    const miles = val / 1609.344
    return miles >= 1000
      ? `${(miles / 1000).toFixed(1)}k mi`
      : `${Math.round(miles).toLocaleString()} mi`
  }
  const km = val / 1000
  return km >= 1000
    ? `${(km / 1000).toFixed(1)}k km`
    : `${Math.round(km).toLocaleString()} km`
}

function formatY(val: number, imperial: boolean) {
  if (imperial) {
    const miles = val / 1609.344
    return miles >= 1000 ? `${(miles / 1000).toFixed(0)}k` : `${Math.round(miles)}`
  }
  const km = val / 1000
  return km >= 1000 ? `${(km / 1000).toFixed(0)}k` : `${Math.round(km)}`
}

interface DistanceModalProps {
  isOpen: boolean
  onClose: () => void
  activities: StravaActivity[]
}

export function DistanceModal({ isOpen, onClose, activities }: DistanceModalProps) {
  return (
    <MilestoneModal
      isOpen={isOpen}
      onClose={onClose}
      title="Distance Journey"
      headerEmoji="📏"
      milestones={DISTANCE_MILESTONES}
      activities={activities}
      getValue={(a) => a.distance}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      emptyIcon="🏃"
      emptyTitle="Start moving!"
      emptyMessage="Log some activities to unlock your first distance milestone."
    />
  )
}
