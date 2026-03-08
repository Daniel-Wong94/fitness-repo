'use client'

import { useSettings } from '@/lib/settings-context'
import type { Theme, Units, ColorScheme } from '@/lib/settings-context'
import { SCHEME_PREVIEW } from '@/lib/colors'

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${value === opt.value
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white font-medium'
              : 'border-gray-300 dark:border-[#30363d] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-[#8b949e] bg-white dark:bg-[#0d1117]'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}


const SCHEME_LABELS: Record<ColorScheme, string> = {
  orange: 'Strava Orange',
  green: 'GitHub Green',
  blue: 'Blue',
  purple: 'Purple',
  teal: 'Teal',
  pink: 'Pink',
  slate: 'Slate',
}

export function SettingsPanel({ modal = false }: { modal?: boolean }) {
  const { settings, updateSetting } = useSettings()

  return (
    <>
      <div className={modal ? 'px-6 py-5' : 'max-w-2xl mx-auto px-4 py-10'}>
        {!modal && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Preferences are saved locally in your browser.
            </p>
          </>
        )}

        <div className="space-y-5">
          {/* Theme */}
          <div className="p-5 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
            <OptionGroup<Theme>
              label="Theme"
              value={settings.theme}
              onChange={(v) => updateSetting('theme', v)}
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </div>

          {/* Units */}
          <div className="p-5 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
            <OptionGroup<Units>
              label="Measurement units"
              value={settings.units}
              onChange={(v) => updateSetting('units', v)}
              options={[
                { value: 'metric', label: 'Metric (km, m, /km, km/h)' },
                { value: 'imperial', label: 'Imperial (mi, ft, /mi, mph)' },
              ]}
            />
          </div>

          {/* Color scheme */}
          <div className="p-5 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Color scheme
            </p>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(SCHEME_PREVIEW) as ColorScheme[]).map((scheme) => {
                const { accent, heatmap } = SCHEME_PREVIEW[scheme]
                const isSelected = settings.colorScheme === scheme
                return (
                  <button
                    key={scheme}
                    onClick={() => updateSetting('colorScheme', scheme)}
                    className={`flex flex-col items-center gap-2.5 px-4 py-3 rounded-lg border transition-colors ${isSelected
                      ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
                      : 'border-gray-300 dark:border-[#30363d] hover:border-gray-400 dark:hover:border-[#8b949e]'
                      }`}
                  >
                    {/* Accent dot + heatmap gradient */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      <div className="flex gap-0.5">
                        {heatmap.map((color, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: isSelected ? accent : undefined }}
                    >
                      {SCHEME_LABELS[scheme]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
