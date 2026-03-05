import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const date = searchParams.get('date') // ISO UTC string, e.g. "2024-06-15T08:30:00Z"
  const units = searchParams.get('units') ?? 'metric'

  if (!lat || !lon || !date) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
  }

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const dateStr = dateObj.toISOString().slice(0, 10) // YYYY-MM-DD

  const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius'
  const windUnit = units === 'imperial' ? 'mph' : 'kmh'

  const url = new URL('https://archive-api.open-meteo.com/v1/archive')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('start_date', dateStr)
  url.searchParams.set('end_date', dateStr)
  url.searchParams.set('hourly', 'temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,relativehumidity_2m')
  url.searchParams.set('wind_speed_unit', windUnit)
  url.searchParams.set('temperature_unit', tempUnit)
  url.searchParams.set('timezone', 'auto')

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Weather API error' }, { status: 502 })
    }

    const data = await res.json()
    const hourly = data.hourly

    if (!hourly?.time?.length) {
      return NextResponse.json({ error: 'No hourly data' }, { status: 502 })
    }

    // Find the index matching the activity's UTC hour
    const targetHour = dateObj.getUTCHours()
    // Open-Meteo returns local times in 'auto' timezone; match by hour of day
    // Use the hour from the times array (HH:MM format ending in :00)
    let idx = hourly.time.findIndex((t: string) => {
      const h = parseInt(t.slice(11, 13), 10)
      return h === targetHour
    })
    if (idx === -1) idx = 0

    return NextResponse.json({
      temperature: Math.round(hourly.temperature_2m[idx] * 10) / 10,
      apparentTemperature: Math.round(hourly.apparent_temperature[idx] * 10) / 10,
      weatherCode: hourly.weathercode[idx],
      windspeed: Math.round(hourly.windspeed_10m[idx]),
      winddirection: hourly.winddirection_10m[idx],
      humidity: hourly.relativehumidity_2m[idx],
      tempUnit,
      windUnit,
    })
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 502 })
  }
}
