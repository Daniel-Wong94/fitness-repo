'use client'

import Link from 'next/link'
import { useSettings } from '@/lib/settings-context'
import type { Theme, Units, HeatmapColor } from '@/lib/settings-context'

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string; description?: string }[]
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
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
              value === opt.value
                ? 'bg-[#FC4C02] border-[#FC4C02] text-white font-medium'
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

const HEATMAP_PREVIEW: Record<HeatmapColor, string[]> = {
  orange: ['bg-[#ebedf0] dark:bg-[#161b22]', 'bg-[#fdba74] dark:bg-[#7c2d12]', 'bg-[#fb923c] dark:bg-[#9a3412]', 'bg-[#ea580c] dark:bg-[#c2410c]', 'bg-[#FC4C02] dark:bg-[#ea580c]'],
  green: ['bg-[#ebedf0] dark:bg-[#161b22]', 'bg-[#9be9a8] dark:bg-[#0e4429]', 'bg-[#40c463] dark:bg-[#006d32]', 'bg-[#30a14e] dark:bg-[#26a641]', 'bg-[#216e39] dark:bg-[#39d353]'],
  blue: ['bg-[#ebedf0] dark:bg-[#161b22]', 'bg-[#bae6fd] dark:bg-[#0c2a4a]', 'bg-[#38bdf8] dark:bg-[#075985]', 'bg-[#0284c7] dark:bg-[#0284c7]', 'bg-[#0c4a6e] dark:bg-[#38bdf8]'],
}

export function SettingsPanel() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#FC4C02"
              className="w-6 h-6"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.172" />
            </svg>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Strava Dashboard
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Preferences are saved locally in your browser.
        </p>

        <div className="space-y-8">
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

          {/* Heatmap color */}
          <div className="p-5 border border-gray-200 dark:border-[#30363d] rounded-lg bg-white dark:bg-[#0d1117]">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Heatmap color scheme
            </p>
            <div className="flex flex-wrap gap-3">
              {(['orange', 'green', 'blue'] as HeatmapColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => updateSetting('heatmapColor', color)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                    settings.heatmapColor === color
                      ? 'border-[#FC4C02] ring-1 ring-[#FC4C02]'
                      : 'border-gray-300 dark:border-[#30363d] hover:border-gray-400 dark:hover:border-[#8b949e]'
                  }`}
                >
                  {/* Mini heatmap preview */}
                  <div className="flex gap-0.5">
                    {HEATMAP_PREVIEW[color].map((cls, i) => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
                    ))}
                  </div>
                  <span className={`text-xs capitalize font-medium ${
                    settings.heatmapColor === color
                      ? 'text-[#FC4C02]'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {color}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
