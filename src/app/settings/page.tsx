import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import AccountSection from './components/AccountSection'
import PreferencesSection from './components/PreferencesSection'
import NotificationsSection from './components/NotificationsSection'
import AboutSection from './components/AboutSection'

function SectionSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  const defaultSettings = {
    weight_unit: 'metric' as const,
    calorie_display: 'kcal' as const,
    theme: 'system' as const,
    meal_reminders: false,
    daily_summary: false,
    reminder_time: '08:00',
  }

  const settings = userSettings ? {
    weight_unit: userSettings.weight_unit ?? defaultSettings.weight_unit,
    calorie_display: userSettings.calorie_display ?? defaultSettings.calorie_display,
    theme: userSettings.theme ?? defaultSettings.theme,
    meal_reminders: userSettings.meal_reminders ?? defaultSettings.meal_reminders,
    daily_summary: userSettings.daily_summary ?? defaultSettings.daily_summary,
    reminder_time: userSettings.reminder_time ?? defaultSettings.reminder_time,
  } : defaultSettings

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and app preferences</p>
        </div>

        <Suspense fallback={<SectionSkeleton />}>
          <AccountSection email={session.user.email ?? ''} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PreferencesSection settings={{
            weight_unit: settings.weight_unit,
            calorie_display: settings.calorie_display,
            theme: settings.theme,
          }} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <NotificationsSection settings={{
            meal_reminders: settings.meal_reminders,
            daily_summary: settings.daily_summary,
            reminder_time: settings.reminder_time,
          }} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>
      </div>
    </div>
  )
}
