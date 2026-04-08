'use client';

import { useState } from 'react';
import Link from 'next/link';
import { calculateSuggestedTargets } from '@/lib/nutrition-calculator';
import type { UserProfileForCalc, CalorieTargets } from '@/lib/nutrition-calculator';
import type { UserProfile, Goal, ActivityLevel } from '@/types/profile';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function cmToDisplay(cm: number): string {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${ft}'${inches}" (${Math.round(cm)} cm)`;
}

function kgToDisplay(kg: number): string {
  const lbs = Math.round(kg * 2.20462 * 10) / 10;
  return `${kg} kg (${lbs} lbs)`;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extremely_active: 'Extremely Active',
};

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss',
  maintenance: 'Maintenance',
  muscle_gain: 'Muscle Gain',
};

const GOAL_BADGE_COLORS: Record<string, string> = {
  weight_loss: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-green-100 text-green-700',
  muscle_gain: 'bg-orange-100 text-orange-700',
};

const VALID_ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extremely_active',
];

interface EditData {
  full_name: string;
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
}

interface Props {
  profile: UserProfile;
  activeGoal: Goal | null;
}

export default function ProfileView({ profile, activeGoal }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    full_name: profile.full_name ?? '',
    age: profile.age ? String(profile.age) : '',
    gender: profile.gender ?? '',
    height_cm: profile.height_cm ? String(profile.height_cm) : '',
    weight_kg: profile.weight_kg ? String(profile.weight_kg) : '',
    activity_level: profile.activity_level ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Live preview of suggested calories while editing
  function getLiveTargets(): CalorieTargets | null {
    const w = parseFloat(editData.weight_kg);
    const h = parseFloat(editData.height_cm);
    const a = parseInt(editData.age, 10);
    const g = editData.gender;
    const al = editData.activity_level;
    const gt = activeGoal?.goal_type;

    if (w && h && a && g && al && gt) {
      const profileForCalc: UserProfileForCalc = {
        weight_kg: w,
        height_cm: h,
        age: a,
        gender: g as UserProfileForCalc['gender'],
        activity_level: al as UserProfileForCalc['activity_level'],
      };
      return calculateSuggestedTargets(profileForCalc, gt);
    }
    return null;
  }

  const liveTargets = isEditing ? getLiveTargets() : null;

  async function handleSave() {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const body: Record<string, unknown> = {};
      body.full_name = editData.full_name || null;
      const age = parseInt(editData.age, 10);
      if (!isNaN(age)) body.age = age;
      if (editData.gender) body.gender = editData.gender;
      const h = parseFloat(editData.height_cm);
      if (!isNaN(h)) body.height_cm = h;
      const w = parseFloat(editData.weight_kg);
      if (!isNaN(w)) body.weight_kg = w;
      if (editData.activity_level) body.activity_level = editData.activity_level;

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile.');
      }

      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setEditData({
      full_name: profile.full_name ?? '',
      age: profile.age ? String(profile.age) : '',
      gender: profile.gender ?? '',
      height_cm: profile.height_cm ? String(profile.height_cm) : '',
      weight_kg: profile.weight_kg ? String(profile.weight_kg) : '',
      activity_level: profile.activity_level ?? '',
    });
    setError('');
    setIsEditing(false);
  }

  // ─── View Mode ───────────────────────────────────────────────────────────
  function renderViewMode() {
    return (
      <div className="space-y-6">
        {/* Personal Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-green-600 font-medium hover:text-green-700"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Name" value={profile.full_name ?? '—'} />
            <InfoRow label="Age" value={profile.age ? `${profile.age} years` : '—'} />
            <InfoRow label="Gender" value={profile.gender ? capitalize(profile.gender) : '—'} />
            <InfoRow
              label="Height"
              value={profile.height_cm ? cmToDisplay(profile.height_cm) : '—'}
              fullWidth
            />
            <InfoRow
              label="Weight"
              value={profile.weight_kg ? kgToDisplay(profile.weight_kg) : '—'}
              fullWidth
            />
            <InfoRow
              label="Activity Level"
              value={profile.activity_level ? ACTIVITY_LABELS[profile.activity_level] : '—'}
              fullWidth
            />
          </div>
        </div>

        {/* Goal Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Nutrition Goal</h2>
            <Link
              href="/profile/goal"
              className="text-sm text-green-600 font-medium hover:text-green-700"
            >
              Change Goal
            </Link>
          </div>

          {activeGoal ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    GOAL_BADGE_COLORS[activeGoal.goal_type] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {GOAL_LABELS[activeGoal.goal_type]}
                </span>
                {activeGoal.target_weight_kg && (
                  <span className="text-sm text-gray-500">
                    Target: {activeGoal.target_weight_kg} kg
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MacroCard
                  label="Calories"
                  value={activeGoal.daily_calories?.toString() ?? '—'}
                  unit="kcal"
                  color="text-gray-800"
                />
                <MacroCard
                  label="Protein"
                  value={activeGoal.daily_protein_g?.toString() ?? '—'}
                  unit="g"
                  color="text-blue-600"
                />
                <MacroCard
                  label="Carbs"
                  value={activeGoal.daily_carbs_g?.toString() ?? '—'}
                  unit="g"
                  color="text-yellow-600"
                />
                <MacroCard
                  label="Fat"
                  value={activeGoal.daily_fat_g?.toString() ?? '—'}
                  unit="g"
                  color="text-red-500"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">You haven't set a goal yet.</p>
              <Link
                href="/profile/goal"
                className="inline-block px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Set a Goal
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Edit Mode ───────────────────────────────────────────────────────────
  function renderEditMode() {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">Edit Profile</h2>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            value={editData.full_name}
            onChange={(e) => setEditData((d) => ({ ...d, full_name: e.target.value }))}
            placeholder="Your name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
          <input
            type="number"
            value={editData.age}
            onChange={(e) => setEditData((d) => ({ ...d, age: e.target.value }))}
            placeholder="e.g. 28"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
          <div className="flex gap-2">
            {(['male', 'female', 'other'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setEditData((d) => ({ ...d, gender: g }))}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                  editData.gender === g
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm)</label>
          <input
            type="number"
            value={editData.height_cm}
            onChange={(e) => setEditData((d) => ({ ...d, height_cm: e.target.value }))}
            placeholder="e.g. 175"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={editData.weight_kg}
            onChange={(e) => setEditData((d) => ({ ...d, weight_kg: e.target.value }))}
            placeholder="e.g. 70"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Activity Level</label>
          <select
            value={editData.activity_level}
            onChange={(e) => setEditData((d) => ({ ...d, activity_level: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select activity level</option>
            {VALID_ACTIVITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {ACTIVITY_LABELS[level!]}
              </option>
            ))}
          </select>
        </div>

        {/* Live suggested targets preview */}
        {liveTargets && activeGoal && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-green-800 mb-2">
              Suggested targets with these changes:
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <div className="font-bold text-gray-800">{liveTargets.daily_calories}</div>
                <div className="text-gray-500">kcal</div>
              </div>
              <div>
                <div className="font-bold text-blue-600">{liveTargets.daily_protein_g}g</div>
                <div className="text-gray-500">protein</div>
              </div>
              <div>
                <div className="font-bold text-yellow-600">{liveTargets.daily_carbs_g}g</div>
                <div className="text-gray-500">carbs</div>
              </div>
              <div>
                <div className="font-bold text-red-500">{liveTargets.daily_fat_g}g</div>
                <div className="text-gray-500">fat</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <span>✓</span> {successMessage}
        </div>
      )}
      {isEditing ? renderEditMode() : renderViewMode()}
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}

function MacroCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className={`text-xl font-bold ${color}`}>
        {value}
        {value !== '—' && <span className="text-sm font-normal ml-0.5">{unit}</span>}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
