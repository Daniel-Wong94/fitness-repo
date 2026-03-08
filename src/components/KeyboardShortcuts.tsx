'use client'

import { useEffect } from 'react'
import { useSettings } from '@/lib/settings-context'
import type { Theme, Units, ColorScheme } from '@/lib/settings-context'

const THEMES: Theme[] = ['light', 'dark', 'system']
const COLOR_SCHEMES: ColorScheme[] = ['orange', 'green', 'blue', 'purple', 'teal', 'pink', 'slate']

export function KeyboardShortcuts() {
  const { settings, updateSetting } = useSettings()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (!e.altKey || e.metaKey || e.ctrlKey) return

      switch (e.code) {
        case 'KeyT': {

          const next = THEMES[(THEMES.indexOf(settings.theme) + 1) % THEMES.length]
          updateSetting('theme', next)
          break
        }
        case 'KeyU': {

          updateSetting('units', settings.units === 'metric' ? 'imperial' : 'metric')
          break
        }
        case 'KeyC': {

          const next = COLOR_SCHEMES[(COLOR_SCHEMES.indexOf(settings.colorScheme) + 1) % COLOR_SCHEMES.length]
          updateSetting('colorScheme', next)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settings, updateSetting])

  return null
}
