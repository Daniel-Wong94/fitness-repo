'use client'

import { useEffect, useRef } from 'react'
import polyline from '@mapbox/polyline'
import { useSettings } from '@/lib/settings-context'
import type { Theme, ColorScheme } from '@/lib/settings-context'
import 'maplibre-gl/dist/maplibre-gl.css'

const ROUTE_COLORS: Record<ColorScheme, string> = {
  orange: '#f97316',
  green:  '#22c55e',
  blue:   '#3b82f6',
  purple: '#a855f7',
  teal:   '#14b8a6',
  pink:   '#ec4899',
  slate:  '#64748b',
}


const STYLE_DARK = 'https://tiles.openfreemap.org/styles/dark'
const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty'

function resolveStyle(theme: Theme): string {
  if (theme === 'dark') return STYLE_DARK
  if (theme === 'light') return STYLE_LIGHT
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? STYLE_DARK : STYLE_LIGHT
}

function remove3DBuildings(mapRef: React.MutableRefObject<any>) {
  const map = mapRef.current
  if (!map) return

  const layers = map.getStyle().layers || []

  layers.forEach((layer: any) => {
    if (layer.type === 'fill-extrusion') {
      map.removeLayer(layer.id)
    }
  })
}

interface Props {
  summaryPolyline: string
}

export function ActivityMap({ summaryPolyline }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const lngLatRef = useRef<[number, number][]>([])
  const { settings } = useSettings()
  const colorSchemeRef = useRef<ColorScheme>(settings.colorScheme)
  colorSchemeRef.current = settings.colorScheme

  function addRouteLayers() {
    const map = mapRef.current
    const lngLat = lngLatRef.current
    if (!map || !lngLat.length || map.getSource('route')) return

    map.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: lngLat }, properties: {} },
    })
    map.addLayer({
      id: 'route-outline',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.3 },
    })
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ROUTE_COLORS[colorSchemeRef.current], 'line-width': 3.5 },
    })
  }

  // Initialize map on mount
  useEffect(() => {
    if (!containerRef.current || !summaryPolyline) return

    const coords = polyline.decode(summaryPolyline) as [number, number][]
    if (!coords.length) return

    const lngLat: [number, number][] = coords.map(([lat, lng]) => [lng, lat])
    lngLatRef.current = lngLat

    let mqlCleanup: (() => void) | null = null

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (!containerRef.current || mapRef.current) return

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: resolveStyle(settings.theme),
        attributionControl: false,
      })
      mapRef.current = map

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

      map.on('load', () => {
        remove3DBuildings(mapRef)

        const lngs = lngLat.map(([lng]) => lng)
        const lats = lngLat.map(([, lat]) => lat)
        map.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: 48, animate: false }
        )

        addRouteLayers()

        new maplibregl.Marker({ color: '#22c55e', scale: 0.7 }).setLngLat(lngLat[0]).addTo(map)
        new maplibregl.Marker({ color: '#ef4444', scale: 0.7 }).setLngLat(lngLat[lngLat.length - 1]).addTo(map)
      })

      // When OS dark mode changes and theme is 'system', swap style
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const onSystemChange = () => {
        if (settings.theme === 'system') {
          map.setStyle(mql.matches ? STYLE_DARK : STYLE_LIGHT)
          map.once('style.load', addRouteLayers)
        }
      }
      mql.addEventListener('change', onSystemChange)
      mqlCleanup = () => mql.removeEventListener('change', onSystemChange)
    })

    return () => {
      mqlCleanup?.()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Swap style when user changes the theme setting
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setStyle(resolveStyle(settings.theme))
    map.once('style.load', addRouteLayers)
  }, [settings.theme]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update route line color when color scheme changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getLayer('route-line')) return
    map.setPaintProperty('route-line', 'line-color', ROUTE_COLORS[settings.colorScheme])
  }, [settings.colorScheme])

  if (!summaryPolyline) return null

  return (
    <div
      ref={containerRef}
      className="h-96 w-full rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-white/10"
    />
  )
}
