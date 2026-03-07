'use client'

import type { StravaActivity } from '@/lib/types'
import { MilestoneModal, type Milestone } from './MilestoneModal'
import { Ruler, Footprints } from 'lucide-react'

const DISTANCE_MILESTONES: Milestone[] = [
  { name: 'First Mile', threshold: 1609 },
  { name: '5K', threshold: 5000 },
  { name: '10K', threshold: 10000 },
  { name: 'Half Marathon', threshold: 21097 },
  { name: 'Marathon', threshold: 42195 },
  { name: 'Ultra Initiate', threshold: 80467 },
  { name: 'Century Walker', threshold: 160934 },
  { name: 'Cross England', threshold: 300000 },
  { name: 'Road Song', threshold: 804672 },
  { name: 'Trailblazer', threshold: 1500000 },
  { name: 'Four-Digit Club', threshold: 1609344 },
  { name: 'Endurance Engine', threshold: 3218688 },
  { name: 'Outback Crossing', threshold: 4000000 },
  { name: 'Coast Runner', threshold: 4500000 },
  { name: 'Atlantic Drifter', threshold: 5600000 },
  { name: 'Earthbound (earth radius)', threshold: 6371000 },
  { name: 'Pacific Voyager', threshold: 10000000 },
  { name: 'Worldsplitter (earth diameter)', threshold: 12742000 },
  { name: 'Horizon Chaser (halfway around earth)', threshold: 20037500 },
  { name: 'Globe Trotter (around the earth)', threshold: 40075000 },
  { name: 'Continental Drift', threshold: 60112500 },
  { name: 'Planet Walker', threshold: 80150000 },
  { name: 'World Weaver', threshold: 120225000 },
  { name: 'Orbit Dreamer', threshold: 160300000 },
  { name: 'Earth Archivist', threshold: 200375000 },
  { name: 'Legend of Distance', threshold: 400750000 },
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
      HeaderIcon={Ruler}
      milestones={DISTANCE_MILESTONES}
      activities={activities}
      getValue={(a) => a.distance}
      formatDisplay={formatDisplay}
      formatThreshold={formatThreshold}
      formatY={formatY}
      EmptyIcon={Footprints}
      emptyTitle="Start moving!"
      emptyMessage="Log some activities to unlock your first distance milestone."
    />
  )
}
