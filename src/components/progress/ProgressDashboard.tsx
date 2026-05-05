'use client';

import { useState, useEffect, useCallback } from 'react';
import PeriodSelector from './PeriodSelector';
import StreakCard from './StreakCard';
import CalorieHistoryChart from './CalorieHistoryChart';
import MacroTrendChart from './MacroTrendChart';
import WeightProgressChart from './WeightProgressChart';
import WeightLogForm from './WeightLogForm';

interface CaloriePoint {
  date: string;
  calories: number;
}

interface MacroPoint {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}

interface WeightPoint {
  date: string;
  weight_kg: number;
}

interface ProgressSummary {
  calorieSeries: CaloriePoint[];
  macroSeries: MacroPoint[];
  streak: number;
  weeklyAverages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
  goalWeight?: number;
}

export default function ProgressDashboard() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [progressData, setProgressData] = useState<ProgressSummary | null>(null);
  const [weightData, setWeightData] = useState<WeightPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [progressRes, weightRes] = await Promise.all([
        fetch(`/api/progress/summary?days=${days}`),
        fetch(`/api/weight?days=${days}`),
      ]);

      if (!progressRes.ok) {
        throw new Error('Failed to fetch progress data');
      }
      if (!weightRes.ok) {
        throw new Error('Failed to fetch weight data');
      }

      const [progressJson, weightJson] = await Promise.all([
        progressRes.json(),
        weightRes.json(),
      ]);

      setProgressData(progressJson);
      setWeightData(weightJson.data || []);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = (newDays: 7 | 30 | 90) => {
    setDays(newDays);
  };

  const handleWeightLogged = () => {
    fetchData();
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-700 font-medium">Failed to load progress data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <PeriodSelector value={days} onChange={handlePeriodChange} />
      </div>

      {/* Streak and Averages Card */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ) : progressData ? (
        <StreakCard
          streak={progressData.streak}
          weeklyAverages={progressData.weeklyAverages}
        />
      ) : null}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie History Chart */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          ) : (
            <CalorieHistoryChart
              data={progressData?.calorieSeries || []}
              goalCalories={progressData?.goalCalories || 2000}
              days={days}
            />
          )}
        </div>

        {/* Macro Trend Chart */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          ) : (
            <MacroTrendChart
              data={progressData?.macroSeries || []}
              days={days}
            />
          )}
        </div>

        {/* Weight Progress Chart */}
        <div>
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          ) : (
            <WeightProgressChart
              data={weightData}
              goalWeight={progressData?.goalWeight}
              unit="kg"
            />
          )}
        </div>

        {/* Weight Log Form */}
        <div>
          <WeightLogForm onSuccess={handleWeightLogged} />
        </div>
      </div>
    </div>
  );
}
