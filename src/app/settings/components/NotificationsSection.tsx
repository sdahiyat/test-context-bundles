'use client'

import { useState } from 'react'
import SettingsCard from './SettingsCard'

interface NotificationSettings {
  meal_reminders: boolean
  daily_summary: boolean
  reminder_time: string
}

interface NotificationsSectionProps {
  settings: NotificationSettings
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function NotificationsSection({ settings }: NotificationsSectionProps) {
  const [prefs, setPrefs] = useState(settings)
  const [saving, setSaving] = useState(false)

  const savePreference = async (updates: Partial<NotificationSettings>) => {
    setSaving(true)
    try {
      await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  const handleMealReminders = (value: boolean) => {
    setPrefs(p => ({ ...p, meal_reminders: value }))
    savePreference({ meal_reminders: value })
  }

  const handleDailySummary = (value: boolean) => {
    setPrefs(p => ({ ...p, daily_summary: value }))
    savePreference({ daily_summary: value })
  }

  const handleReminderTime = (value: string) => {
    setPrefs(p => ({ ...p, reminder_time: value }))
    savePreference({ reminder_time: value })
  }

  return (
    <SettingsCard title="Notifications" description="Configure your notification preferences">
      {/* Meal reminders */}
      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Meal Reminders</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Get reminded to log your meals</p>
          </div>
          <Toggle
            checked={prefs.meal_reminders}
            onChange={handleMealReminders}
            disabled={saving}
          />
        </div>

        {prefs.meal_reminders && (
          <div className="mt-3 flex items-center gap-3">
            <label className="text-xs text-gray-600 dark:text-gray-400 shrink-0">Reminder time:</label>
            <input
              type="time"
              value={prefs.reminder_time}
              onChange={e => handleReminderTime(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Daily summary */}
      <div className="py-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Daily Summary</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receive a daily nutrition summary</p>
          </div>
          <Toggle
            checked={prefs.daily_summary}
            onChange={handleDailySummary}
            disabled={saving}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="pt-2">
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          Note: Push notifications require browser permission and are not yet active.
        </p>
      </div>
    </SettingsCard>
  )
}
