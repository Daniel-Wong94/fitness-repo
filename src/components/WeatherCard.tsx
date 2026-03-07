'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/settings-context'
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

interface WeatherData {
  temperature: number
  apparentTemperature: number
  weatherCode: number
  windspeed: number
  winddirection: number
  humidity: number
  tempUnit: string
  windUnit: string
}

interface Props {
  lat: number
  lon: number
  startDate: string // UTC ISO string from activity.start_date
}

const WMO_CONDITIONS: Record<number, { label: string; Icon: ComponentType<LucideProps> }> = {
  0:  { label: 'Clear sky',                     Icon: Sun },
  1:  { label: 'Mainly clear',                  Icon: Sun },
  2:  { label: 'Partly cloudy',                 Icon: CloudSun },
  3:  { label: 'Overcast',                      Icon: Cloud },
  45: { label: 'Foggy',                         Icon: CloudFog },
  48: { label: 'Icy fog',                       Icon: CloudFog },
  51: { label: 'Light drizzle',                 Icon: CloudDrizzle },
  53: { label: 'Drizzle',                       Icon: CloudDrizzle },
  55: { label: 'Heavy drizzle',                 Icon: CloudDrizzle },
  56: { label: 'Freezing drizzle',              Icon: CloudDrizzle },
  57: { label: 'Heavy freezing drizzle',        Icon: CloudDrizzle },
  61: { label: 'Light rain',                    Icon: CloudRain },
  63: { label: 'Rain',                          Icon: CloudRain },
  65: { label: 'Heavy rain',                    Icon: CloudRain },
  66: { label: 'Freezing rain',                 Icon: CloudRain },
  67: { label: 'Heavy freezing rain',           Icon: CloudRain },
  71: { label: 'Light snow',                    Icon: CloudSnow },
  73: { label: 'Snow',                          Icon: CloudSnow },
  75: { label: 'Heavy snow',                    Icon: CloudSnow },
  77: { label: 'Snow grains',                   Icon: CloudSnow },
  80: { label: 'Light rain showers',            Icon: CloudRain },
  81: { label: 'Rain showers',                  Icon: CloudRain },
  82: { label: 'Heavy rain showers',            Icon: CloudRain },
  85: { label: 'Snow showers',                  Icon: CloudSnow },
  86: { label: 'Heavy snow showers',            Icon: CloudSnow },
  95: { label: 'Thunderstorm',                  Icon: CloudLightning },
  96: { label: 'Thunderstorm with hail',        Icon: CloudLightning },
  99: { label: 'Thunderstorm with heavy hail',  Icon: CloudLightning },
}

function getCondition(code: number): { label: string; Icon: ComponentType<LucideProps> } {
  return WMO_CONDITIONS[code] ?? { label: 'Unknown', Icon: Thermometer }
}

function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export function WeatherCard({ lat, lon, startDate }: Props) {
  const { settings } = useSettings()
  const units = settings.units
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setWeather(null)

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      date: startDate,
      units,
    })

    fetch(`/api/weather?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setWeather(null)
        } else {
          setWeather(data)
        }
      })
      .catch(() => setWeather(null))
      .finally(() => setLoading(false))
  }, [lat, lon, startDate, units])

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg animate-pulse">
        <div className="h-3 w-16 bg-gray-200 dark:bg-[#30363d] rounded mb-3" />
        <div className="flex gap-3">
          <div className="h-8 w-24 bg-gray-200 dark:bg-[#30363d] rounded" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-[#30363d] rounded" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-[#30363d] rounded" />
        </div>
      </div>
    )
  }

  if (!weather) return null

  const condition = getCondition(weather.weatherCode)
  const tempSuffix = weather.tempUnit === 'fahrenheit' ? '°F' : '°C'
  const windSuffix = weather.windUnit === 'mph' ? 'mph' : 'km/h'

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-lg">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Weather</h2>
      <div className="flex flex-wrap items-center gap-3">
        {/* Condition */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <condition.Icon size={22} className="text-[var(--accent)]" />
          <span className="font-medium">{condition.label}</span>
        </div>

        <span className="text-gray-300 dark:text-gray-600 hidden sm:block">|</span>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          <Chip Icon={Thermometer} label={`${weather.temperature}${tempSuffix}`} sub={`Feels ${weather.apparentTemperature}${tempSuffix}`} />
          <Chip Icon={Wind} label={`${weather.windspeed} ${windSuffix}`} sub={windDirection(weather.winddirection)} />
          <Chip Icon={Droplets} label={`${weather.humidity}%`} sub="Humidity" />
        </div>
      </div>
    </div>
  )
}

function Chip({ Icon, label, sub }: { Icon: ComponentType<LucideProps>; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-md text-sm">
      <Icon size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
      <span className="font-medium text-gray-900 dark:text-white">{label}</span>
      <span className="text-gray-400 dark:text-gray-500 text-xs">{sub}</span>
    </div>
  )
}
