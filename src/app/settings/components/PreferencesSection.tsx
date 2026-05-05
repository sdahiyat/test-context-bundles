'use client'

import { useState, useCallback, useRef } from 'react'
import SettingsCard from './SettingsCard'

type WeightUnit = 'metric' | 'imperial'
type CalorieDisplay = 'kcal' | 'kJ'
type Theme = 'light' | 'dark' | 'system'

interface UserSettings {
  weight_unit: WeightUnit
  calorie_display: CalorieDisplay
  theme: Theme
}

interface PreferencesSectionProps {
  settings: UserSettings
}

export default function PreferencesSection({ settings }: PreferencesSectionProps) {
  const [prefs, setPrefs] = useState<UserSettings>(settings)
  const [savedVisible, setSavedVisible] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const savePreferences = useCallback((updated: Partial<UserSettings>) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/settings/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
        if (res.ok) {
          setSavedVisible(true)
          setTimeout(() => setSavedVisible(false), 1500)
        }
      } catch {
        // silently fail for preferences
      }
    }, 300)
  }, [])

  const handleWeightUnit = (value: WeightUnit) => {
    setPrefs(p => ({ ...p, weight_unit: value }))
    savePreferences({ weight_unit: value })
  }

  const handleCalorieDisplay = (value: CalorieDisplay) => {
    setPrefs(p => ({ ...p, calorie_display: value }))
    savePreferences({ calorie_display: value })
  }

  const handleTheme = (value: Theme) => {
    setPrefs(p => ({ ...p, theme: value }))
    savePreferences({ theme: value })

    // Apply theme immediately
    localStorage.setItem('nutritrack-theme', value)
    if (value === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    document.documentElement.setAttribute('data-theme', value)
  }

  return (
    <SettingsCard title="Preferences" description="Customize units and display settings">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">Preferences</span>
        <span
          className={`text-xs text-green-600 dark:text-green-400 flex items-center gap-1 transition-opacity duration-300 ${savedVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Saved
        </span>
      </div>

      {/* Weight unit */}
      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Weight Unit</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Unit for displaying body weight and food weight</p>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
            <button
              onClick={() => handleWeightUnit('metric')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                prefs.weight_unit === 'metric'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Metric (kg)
            </button>
            <button
              onClick={() => handleWeightUnit('imperial')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                prefs.weight_unit === 'imperial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Imperial (lbs)
            </button>
          </div>
        </div>
      </div>

      {/* Calorie display */}
      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Calorie Display</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Unit for displaying energy values</p>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
            <button
              onClick={() => handleCalorieDisplay('kcal')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                prefs.calorie_display === 'kcal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              kcal
            </button>
            <button
              onClick={() => handleCalorieDisplay('kJ')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                prefs.calorie_display === 'kJ'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              kJ
            </button>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="py-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choose your preferred color theme</p>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
            {(['light', 'dark', 'system'] as Theme[]).map(t => (
              <button
                key={t}
                onClick={() => handleTheme(t)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  prefs.theme === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}
