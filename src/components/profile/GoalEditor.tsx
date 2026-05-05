'use client';

import { useState, useEffect } from 'react';
import { calculateSuggestedTargets } from '@/lib/nutrition-calculator';
import type { UserProfileForCalc, CalorieTargets } from '@/lib/nutrition-calculator';
import type { UserProfile, Goal, GoalType } from '@/types/profile';

const GOAL_OPTIONS: { value: GoalType; label: string; description: string; icon: string }[] = [
  {
    value: 'weight_loss',
    label: 'Weight Loss',
    description: 'Lose weight with a calorie deficit',
    icon: '📉',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'Maintain current weight',
    icon: '⚖️',
  },
  {
    value: 'muscle_gain',
    label: 'Muscle Gain',
    description: 'Build muscle with a calorie surplus',
    icon: '💪',
  },
];

interface Props {
  userId: string;
  currentGoal: Goal | null;
  userProfile: UserProfile;
  onSave: (goal: Goal) => void;
  onCancel: () => void;
}

export default function GoalEditor({ userId: _userId, currentGoal, userProfile, onSave, onCancel }: Props) {
  const [goalType, setGoalType] = useState<GoalType>(currentGoal?.goal_type ?? 'maintenance');
  const [targetWeight, setTargetWeight] = useState(
    currentGoal?.target_weight_kg ? String(currentGoal.target_weight_kg) : ''
  );
  const [useCustomMacros, setUseCustomMacros] = useState(false);
  const [customCalories, setCustomCalories] = useState(
    currentGoal?.daily_calories ? String(currentGoal.daily_calories) : ''
  );
  const [customProtein, setCustomProtein] = useState(
    currentGoal?.daily_protein_g ? String(currentGoal.daily_protein_g) : ''
  );
  const [customCarbs, setCustomCarbs] = useState(
    currentGoal?.daily_carbs_g ? String(currentGoal.daily_carbs_g) : ''
  );
  const [customFat, setCustomFat] = useState(
    currentGoal?.daily_fat_g ? String(currentGoal.daily_fat_g) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedTargets, setSuggestedTargets] = useState<CalorieTargets | null>(null);

  // Compute suggested targets whenever goalType or profile changes
  useEffect(() => {
    const { weight_kg, height_cm, age, gender, activity_level } = userProfile;
    if (weight_kg && height_cm && age && gender && activity_level) {
      const profileForCalc: UserProfileForCalc = {
        weight_kg,
        height_cm,
        age,
        gender: gender as UserProfileForCalc['gender'],
        activity_level: activity_level as UserProfileForCalc['activity_level'],
      };
      const targets = calculateSuggestedTargets(profileForCalc, goalType);
      setSuggestedTargets(targets);
    } else {
      setSuggestedTargets(null);
    }
  }, [goalType, userProfile]);

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      const body: Record<string, unknown> = {
        goal_type: goalType,
        target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
      };

      if (useCustomMacros) {
        body.daily_calories = customCalories ? parseInt(customCalories, 10) : null;
        body.daily_protein_g = customProtein ? parseInt(customProtein, 10) : null;
        body.daily_carbs_g = customCarbs ? parseInt(customCarbs, 10) : null;
        body.daily_fat_g = customFat ? parseInt(customFat, 10) : null;
      } else {
        body.use_suggested = true;
      }

      let res: Response;
      if (currentGoal) {
        res = await fetch(`/api/goals/${currentGoal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save goal.');
      }

      const savedGoal: Goal = await res.json();
      onSave(savedGoal);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const profileIsComplete =
    !!userProfile.weight_kg &&
    !!userProfile.height_cm &&
    !!userProfile.age &&
    !!userProfile.gender &&
    !!userProfile.activity_level;

  return (
    <div className="space-y-6">
      {/* Goal Type Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Select Your Goal</h3>
        {GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setGoalType(opt.value)}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              goalType === opt.value
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl mt-0.5">{opt.icon}</span>
            <div>
              <div
                className={`font-semibold text-sm ${
                  goalType === opt.value ? 'text-green-700' : 'text-gray-800'
                }`}
              >
                {opt.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Target Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Weight <span className="text-gray-400">(optional, kg)</span>
        </label>
        <input
          type="number"
          value={targetWeight}
          onChange={(e) => setTargetWeight(e.target.value)}
          placeholder="e.g. 65"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Suggested Targets Preview */}
      {suggestedTargets && profileIsComplete ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-2">✨ Suggested Daily Targets</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-gray-800">{suggestedTargets.daily_calories}</div>
              <div className="text-xs text-gray-500">Calories</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-600">{suggestedTargets.daily_protein_g}g</div>
              <div className="text-xs text-gray-500">Protein</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-yellow-600">{suggestedTargets.daily_carbs_g}g</div>
              <div className="text-xs text-gray-500">Carbs</div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-red-500">{suggestedTargets.daily_fat_g}g</div>
              <div className="text-xs text-gray-500">Fat</div>
            </div>
          </div>
        </div>
      ) : !profileIsComplete ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Complete your profile (weight, height, age, gender, activity level) to see suggested targets.
        </div>
      ) : null}

      {/* Custom Macro Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setUseCustomMacros((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            useCustomMacros ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              useCustomMacros ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">Customize my own macros</span>
      </div>

      {useCustomMacros && (
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Daily Calories</label>
            <input
              type="number"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Protein (g)</label>
              <input
                type="number"
                value={customProtein}
                onChange={(e) => setCustomProtein(e.target.value)}
                placeholder="150"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={customCarbs}
                onChange={(e) => setCustomCarbs(e.target.value)}
                placeholder="200"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fat (g)</label>
              <input
                type="number"
                value={customFat}
                onChange={(e) => setCustomFat(e.target.value)}
                placeholder="65"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-medium transition-colors"
        >
          {loading ? 'Saving…' : 'Save Goal'}
        </button>
      </div>
    </div>
  );
}
