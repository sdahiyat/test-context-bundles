'use client';

import { useState, useEffect, useCallback } from 'react';
import { MealWithItems, UserGoals, UserProfile, calculateDailyTotals } from '@/types/nutrition';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import DateNavigator from './components/DateNavigator';
import CalorieSummaryCard from './components/CalorieSummaryCard';
import MacroSummarySection from './components/MacroSummarySection';
import MacroDistributionChart from './components/MacroDistributionChart';
import MealsList from './components/MealsList';

export type DashboardData = {
  meals: MealWithItems[];
  selectedDate: string;
};

interface DashboardClientProps {
  initialDate: string;
  initialMeals: MealWithItems[];
  userGoals: UserGoals | null;
  profile: UserProfile | null;
}

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA');
}

function adjustDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
}

export default function DashboardClient({
  initialDate,
  initialMeals,
  userGoals,
  profile,
}: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [meals, setMeals] = useState<MealWithItems[]>(initialMeals);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = getTodayDateString();
  const isToday = selectedDate === today;

  const fetchMealsForDate = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/summary?date=${date}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch meals');
      }
      const data = await response.json();
      setMeals(data.meals || []);
    } catch (err) {
      console.error('Fetch meals error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load meals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Re-fetch when date changes (skip initial render since we have server data)
  const isInitialRender = useState(true);
  useEffect(() => {
    if (isInitialRender[0]) {
      isInitialRender[1](false);
      return;
    }
    fetchMealsForDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Auto-refresh callback (memoized)
  const autoRefreshCallback = useCallback(() => {
    fetchMealsForDate(selectedDate);
  }, [fetchMealsForDate, selectedDate]);

  // Auto-refresh every 30 seconds when viewing today
  useAutoRefresh(autoRefreshCallback, 30000, isToday);

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (direction === 'next' && isToday) return;
    setSelectedDate((prev) => adjustDate(prev, direction === 'next' ? 1 : -1));
  };

  // Compute totals
  const totals = calculateDailyTotals(meals);
  const remaining =
    userGoals?.daily_calories !== null && userGoals?.daily_calories !== undefined
      ? userGoals.daily_calories - totals.calories
      : null;

  const macroGoals =
    userGoals
      ? {
          protein: userGoals.daily_protein ?? null,
          carbs: userGoals.daily_carbs ?? null,
          fat: userGoals.daily_fat ?? null,
        }
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            {profile?.display_name && (
              <p className="text-xs text-gray-500">
                Welcome back, {profile.display_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Date Navigator */}
        <DateNavigator
          currentDate={selectedDate}
          onPrev={() => handleDateChange('prev')}
          onNext={() => handleDateChange('next')}
          isNextDisabled={isToday}
        />

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Loading overlay for date changes */}
        {isLoading && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">Refreshing...</p>
          </div>
        )}

        {/* Calorie Summary */}
        <CalorieSummaryCard
          consumed={totals.calories}
          target={userGoals?.daily_calories ?? null}
          remaining={remaining}
        />

        {/* Macro Summary */}
        <MacroSummarySection
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
          goals={macroGoals}
        />

        {/* Macro Distribution Chart */}
        <MacroDistributionChart
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
        />

        {/* Meals List */}
        <MealsList
          meals={meals}
          onMealDeleted={() => fetchMealsForDate(selectedDate)}
        />

        {/* Goals prompt if no goals set */}
        {!userGoals && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-amber-800 text-sm font-medium">
              Set your nutrition goals to track progress
            </p>
            <a
              href="/profile"
              className="inline-block mt-2 text-xs font-semibold text-amber-700 underline hover:text-amber-900"
            >
              Go to Profile →
            </a>
          </div>
        )}

        {/* Bottom spacer for mobile nav */}
        <div className="h-6" />
      </main>
    </div>
  );
}
