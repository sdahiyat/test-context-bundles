'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateSuggestedTargets } from '@/lib/nutrition-calculator';
import type { UserProfileForCalc, CalorieTargets } from '@/lib/nutrition-calculator';

// ─── Unit conversion helpers ─────────────────────────────────────────────────
function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { ft, inches };
}

function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * 2.54);
}

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Gender = 'male' | 'female' | 'other';
type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';
type GoalType = 'weight_loss' | 'maintenance' | 'muscle_gain';

interface FormData {
  full_name: string;
  age: string;
  gender: Gender | '';
  heightUnit: 'cm' | 'ft';
  height_cm: string;
  heightFt: string;
  heightIn: string;
  weightUnit: 'kg' | 'lbs';
  weight_kg: string;
  weightLbs: string;
  activity_level: ActivityLevel | '';
  goal_type: GoalType | '';
  target_weight_kg: string;
  useCustomMacros: boolean;
  daily_calories: string;
  daily_protein_g: string;
  daily_carbs_g: string;
  daily_fat_g: string;
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string; icon: string }[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little or no exercise, desk job',
    icon: '🪑',
  },
  {
    value: 'lightly_active',
    label: 'Lightly Active',
    description: 'Light exercise 1–3 days/week',
    icon: '🚶',
  },
  {
    value: 'moderately_active',
    label: 'Moderately Active',
    description: 'Moderate exercise 3–5 days/week',
    icon: '🏃',
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Hard exercise 6–7 days/week',
    icon: '💪',
  },
  {
    value: 'extremely_active',
    label: 'Extremely Active',
    description: 'Very hard exercise, physical job',
    icon: '🏋️',
  },
];

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedTargets, setSuggestedTargets] = useState<CalorieTargets | null>(null);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    age: '',
    gender: '',
    heightUnit: 'cm',
    height_cm: '',
    heightFt: '',
    heightIn: '',
    weightUnit: 'kg',
    weight_kg: '',
    weightLbs: '',
    activity_level: '',
    goal_type: '',
    target_weight_kg: '',
    useCustomMacros: false,
    daily_calories: '',
    daily_protein_g: '',
    daily_carbs_g: '',
    daily_fat_g: '',
  });

  // Recalculate suggested targets when relevant fields change
  useEffect(() => {
    const weight = parseFloat(formData.weight_kg);
    const height = parseFloat(formData.height_cm);
    const age = parseInt(formData.age, 10);
    const { gender, activity_level, goal_type } = formData;

    if (weight && height && age && gender && activity_level && goal_type) {
      const profile: UserProfileForCalc = {
        weight_kg: weight,
        height_cm: height,
        age,
        gender: gender as Gender,
        activity_level: activity_level as ActivityLevel,
      };
      const targets = calculateSuggestedTargets(profile, goal_type as GoalType);
      setSuggestedTargets(targets);

      if (!formData.useCustomMacros) {
        setFormData((prev) => ({
          ...prev,
          daily_calories: String(targets.daily_calories),
          daily_protein_g: String(targets.daily_protein_g),
          daily_carbs_g: String(targets.daily_carbs_g),
          daily_fat_g: String(targets.daily_fat_g),
        }));
      }
    } else {
      setSuggestedTargets(null);
    }
  }, [
    formData.weight_kg,
    formData.height_cm,
    formData.age,
    formData.gender,
    formData.activity_level,
    formData.goal_type,
    formData.useCustomMacros,
  ]);

  function updateField(field: keyof FormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleHeightUnitToggle(unit: 'cm' | 'ft') {
    if (unit === formData.heightUnit) return;
    if (unit === 'ft') {
      const cm = parseFloat(formData.height_cm);
      if (!isNaN(cm) && cm > 0) {
        const { ft, inches } = cmToFtIn(cm);
        setFormData((prev) => ({ ...prev, heightUnit: 'ft', heightFt: String(ft), heightIn: String(inches) }));
      } else {
        setFormData((prev) => ({ ...prev, heightUnit: 'ft' }));
      }
    } else {
      const ft = parseInt(formData.heightFt, 10) || 0;
      const inches = parseInt(formData.heightIn, 10) || 0;
      const cm = ftInToCm(ft, inches);
      setFormData((prev) => ({ ...prev, heightUnit: 'cm', height_cm: cm > 0 ? String(cm) : '' }));
    }
  }

  function handleWeightUnitToggle(unit: 'kg' | 'lbs') {
    if (unit === formData.weightUnit) return;
    if (unit === 'lbs') {
      const kg = parseFloat(formData.weight_kg);
      if (!isNaN(kg) && kg > 0) {
        setFormData((prev) => ({ ...prev, weightUnit: 'lbs', weightLbs: String(kgToLbs(kg)) }));
      } else {
        setFormData((prev) => ({ ...prev, weightUnit: 'lbs' }));
      }
    } else {
      const lbs = parseFloat(formData.weightLbs);
      const kg = !isNaN(lbs) && lbs > 0 ? lbsToKg(lbs) : 0;
      setFormData((prev) => ({ ...prev, weightUnit: 'kg', weight_kg: kg > 0 ? String(kg) : '' }));
    }
  }

  function handleHeightFtInChange(field: 'heightFt' | 'heightIn', value: string) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      const ft = parseInt(field === 'heightFt' ? value : updated.heightFt, 10) || 0;
      const inches = parseInt(field === 'heightIn' ? value : updated.heightIn, 10) || 0;
      const cm = ftInToCm(ft, inches);
      return { ...updated, height_cm: cm > 0 ? String(cm) : '' };
    });
  }

  function handleWeightLbsChange(value: string) {
    setFormData((prev) => {
      const lbs = parseFloat(value);
      const kg = !isNaN(lbs) && lbs > 0 ? lbsToKg(lbs) : 0;
      return { ...prev, weightLbs: value, weight_kg: kg > 0 ? String(kg) : '' };
    });
  }

  function validateStep(step: number): string {
    if (step === 1) {
      if (!formData.gender) return 'Please select a gender.';
      if (!formData.age || parseInt(formData.age, 10) < 10 || parseInt(formData.age, 10) > 120) {
        return 'Please enter a valid age (10–120).';
      }
      const height = parseFloat(formData.height_cm);
      if (!height || height < 50 || height > 300) {
        return 'Please enter a valid height.';
      }
      const weight = parseFloat(formData.weight_kg);
      if (!weight || weight < 20 || weight > 500) {
        return 'Please enter a valid weight.';
      }
    }
    if (step === 2) {
      if (!formData.activity_level) return 'Please select an activity level.';
    }
    if (step === 3) {
      if (!formData.goal_type) return 'Please select a goal type.';
    }
    return '';
  }

  function handleNext() {
    const err = validateStep(currentStep);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setCurrentStep((s) => s + 1);
  }

  function handleBack() {
    setError('');
    setCurrentStep((s) => s - 1);
  }

  async function handleSubmit() {
    const err = validateStep(3);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Save profile
      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name || null,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          height_cm: parseFloat(formData.height_cm),
          weight_kg: parseFloat(formData.weight_kg),
          activity_level: formData.activity_level,
        }),
      });

      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.error || 'Failed to save profile.');
      }

      // Save goal
      const goalBody: Record<string, unknown> = {
        goal_type: formData.goal_type,
        target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
      };

      if (formData.useCustomMacros) {
        goalBody.daily_calories = parseInt(formData.daily_calories, 10) || null;
        goalBody.daily_protein_g = parseInt(formData.daily_protein_g, 10) || null;
        goalBody.daily_carbs_g = parseInt(formData.daily_carbs_g, 10) || null;
        goalBody.daily_fat_g = parseInt(formData.daily_fat_g, 10) || null;
      } else {
        goalBody.use_suggested = true;
      }

      const goalRes = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalBody),
      });

      if (!goalRes.ok) {
        const data = await goalRes.json();
        throw new Error(data.error || 'Failed to save goal.');
      }

      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step Renderers ──────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            placeholder="Your name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder="e.g. 28"
            min={10}
            max={120}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
          <div className="flex gap-3">
            {(['male', 'female', 'other'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => updateField('gender', g)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  formData.gender === g
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Height */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Height *</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => handleHeightUnitToggle('cm')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  formData.heightUnit === 'cm'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => handleHeightUnitToggle('ft')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  formData.heightUnit === 'ft'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                ft/in
              </button>
            </div>
          </div>
          {formData.heightUnit === 'cm' ? (
            <input
              type="number"
              value={formData.height_cm}
              onChange={(e) => updateField('height_cm', e.target.value)}
              placeholder="e.g. 175"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.heightFt}
                  onChange={(e) => handleHeightFtInChange('heightFt', e.target.value)}
                  placeholder="5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xs text-gray-500 mt-0.5 block">feet</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.heightIn}
                  onChange={(e) => handleHeightFtInChange('heightIn', e.target.value)}
                  placeholder="9"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xs text-gray-500 mt-0.5 block">inches</span>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Weight *</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => handleWeightUnitToggle('kg')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  formData.weightUnit === 'kg'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => handleWeightUnitToggle('lbs')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  formData.weightUnit === 'lbs'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
          {formData.weightUnit === 'kg' ? (
            <input
              type="number"
              value={formData.weight_kg}
              onChange={(e) => updateField('weight_kg', e.target.value)}
              placeholder="e.g. 70"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <input
              type="number"
              value={formData.weightLbs}
              onChange={(e) => handleWeightLbsChange(e.target.value)}
              placeholder="e.g. 154"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          )}
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          How active are you on a typical week? This helps us calculate your calorie needs.
        </p>
        {ACTIVITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateField('activity_level', opt.value)}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              formData.activity_level === opt.value
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl mt-0.5">{opt.icon}</span>
            <div>
              <div
                className={`font-semibold text-sm ${
                  formData.activity_level === opt.value ? 'text-green-700' : 'text-gray-800'
                }`}
              >
                {opt.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-5">
        {/* Goal type selection */}
        <div className="space-y-3">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField('goal_type', opt.value)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                formData.goal_type === opt.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mt-0.5">{opt.icon}</span>
              <div>
                <div
                  className={`font-semibold text-sm ${
                    formData.goal_type === opt.value ? 'text-green-700' : 'text-gray-800'
                  }`}
                >
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{opt.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Target weight (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Weight{' '}
            <span className="text-gray-400">(optional, kg)</span>
          </label>
          <input
            type="number"
            value={formData.target_weight_kg}
            onChange={(e) => updateField('target_weight_kg', e.target.value)}
            placeholder="e.g. 65"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Suggested targets preview */}
        {suggestedTargets && formData.goal_type && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-2">
              ✨ Suggested Daily Targets
            </h3>
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
        )}

        {/* Custom macro toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateField('useCustomMacros', !formData.useCustomMacros)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              formData.useCustomMacros ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                formData.useCustomMacros ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">Customize my own macros</span>
        </div>

        {formData.useCustomMacros && (
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Daily Calories</label>
              <input
                type="number"
                value={formData.daily_calories}
                onChange={(e) => updateField('daily_calories', e.target.value)}
                placeholder="e.g. 2000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={formData.daily_protein_g}
                  onChange={(e) => updateField('daily_protein_g', e.target.value)}
                  placeholder="150"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.daily_carbs_g}
                  onChange={(e) => updateField('daily_carbs_g', e.target.value)}
                  placeholder="200"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={formData.daily_fat_g}
                  onChange={(e) => updateField('daily_fat_g', e.target.value)}
                  placeholder="65"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const stepTitles = ['Personal Info', 'Activity Level', 'Your Goal'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-green-600 mb-1">NutriTrack</div>
          <h1 className="text-xl font-semibold text-gray-800">Set Up Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Step {currentStep} of 3 — {stepTitles[currentStep - 1]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step <= currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">{stepTitles[currentStep - 1]}</h2>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium transition-colors"
              >
                {loading ? 'Saving…' : 'Finish Setup'}
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        <p className="text-center text-sm text-gray-400 mt-4">
          <a href="/dashboard" className="hover:underline">
            Skip for now
          </a>
        </p>
      </div>
    </div>
  );
}
