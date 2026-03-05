'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/lib/settings-context'

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

const WMO_CONDITIONS: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Clear sky', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' },
  48: { label: 'Icy fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌧️' },
  53: { label: 'Drizzle', emoji: '🌧️' },
  55: { label: 'Heavy drizzle', emoji: '🌧️' },
  56: { label: 'Freezing drizzle', emoji: '🌧️' },
  57: { label: 'Heavy freezing drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌧️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  66: { label: 'Freezing rain', emoji: '🌧️' },
  67: { label: 'Heavy freezing rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '❄️' },
  73: { label: 'Snow', emoji: '❄️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  77: { label: 'Snow grains', emoji: '❄️' },
  80: { label: 'Light rain showers', emoji: '🌦️' },
  81: { label: 'Rain showers', emoji: '🌦️' },
  82: { label: 'Heavy rain showers', emoji: '🌦️' },
  85: { label: 'Snow showers', emoji: '🌨️' },
  86: { label: 'Heavy snow showers', emoji: '🌨️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm with hail', emoji: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', emoji: '⛈️' },
}

function getCondition(code: number): { label: string; emoji: string } {
  return WMO_CONDITIONS[code] ?? { label: 'Unknown', emoji: '🌡️' }
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
          <span className="text-2xl">{condition.emoji}</span>
          <span className="font-medium">{condition.label}</span>
        </div>

        <span className="text-gray-300 dark:text-gray-600 hidden sm:block">|</span>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          <Chip icon="🌡️" label={`${weather.temperature}${tempSuffix}`} sub={`Feels ${weather.apparentTemperature}${tempSuffix}`} />
          <Chip icon="💨" label={`${weather.windspeed} ${windSuffix}`} sub={windDirection(weather.winddirection)} />
          <Chip icon="💧" label={`${weather.humidity}%`} sub="Humidity" />
        </div>
      </div>
    </div>
  )
}

function Chip({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-md text-sm">
      <span>{icon}</span>
      <span className="font-medium text-gray-900 dark:text-white">{label}</span>
      <span className="text-gray-400 dark:text-gray-500 text-xs">{sub}</span>
    </div>
  )
}
