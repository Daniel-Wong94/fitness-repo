'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type Units = 'metric' | 'imperial'
export type HeatmapColor = 'green' | 'orange' | 'blue'

export interface Settings {
  theme: Theme
  units: Units
  heatmapColor: HeatmapColor
}

interface SettingsContextValue {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  units: 'metric',
  heatmapColor: 'orange',
}

const STORAGE_KEY = 'strava_prefs'

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSetting: () => {},
})

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) })
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyTheme(settings.theme)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {}
  }, [settings, mounted])

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
