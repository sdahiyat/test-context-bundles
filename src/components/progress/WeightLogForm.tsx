'use client';

import { useState } from 'react';

interface WeightLogFormProps {
  onSuccess: () => void;
}

export default function WeightLogForm({ onSuccess }: WeightLogFormProps) {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnitToggle = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === unit || !weight) {
      setUnit(newUnit);
      return;
    }
    // Convert displayed value when switching units
    const numWeight = parseFloat(weight);
    if (!isNaN(numWeight)) {
      if (newUnit === 'lbs') {
        setWeight((numWeight * 2.20462).toFixed(1));
      } else {
        setWeight((numWeight / 2.20462).toFixed(1));
      }
    }
    setUnit(newUnit);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) {
      setError('Please enter a valid weight.');
      return;
    }

    // Convert to kg for storage
    const weight_kg = unit === 'lbs' ? numWeight / 2.20462 : numWeight;

    if (weight_kg < 20 || weight_kg > 500) {
      setError('Please enter a realistic weight value.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_kg: Math.round(weight_kg * 100) / 100,
          logged_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to log weight');
      }

      setSuccess(true);
      setWeight('');
      onSuccess();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Log Today's Weight</h2>
      <p className="text-sm text-gray-500 mb-6">
        Record your weight to track progress over time. One entry per day.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Unit Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
          <div
            className="flex rounded-lg overflow-hidden border border-gray-200 w-fit"
            role="group"
            aria-label="Weight unit"
          >
            <button
              type="button"
              onClick={() => handleUnitToggle('kg')}
              aria-pressed={unit === 'kg'}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                unit === 'kg'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => handleUnitToggle('lbs')}
              aria-pressed={unit === 'lbs'}
              className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                unit === 'lbs'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              lbs
            </button>
          </div>
        </div>

        {/* Weight Input */}
        <div>
          <label htmlFor="weight-input" className="block text-sm font-medium text-gray-700 mb-2">
            Weight ({unit})
          </label>
          <div className="relative">
            <input
              id="weight-input"
              type="number"
              step="0.1"
              min={unit === 'kg' ? '20' : '44'}
              max={unit === 'kg' ? '500' : '1100'}
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError(null);
              }}
              placeholder={unit === 'kg' ? 'e.g. 70.5' : 'e.g. 155.4'}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
              disabled={isSubmitting}
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              {unit}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-emerald-500 text-sm">✅</span>
            <p className="text-sm text-emerald-700 font-medium">Weight logged successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !weight}
          className="w-full py-3 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Logging...
            </span>
          ) : (
            'Log Weight'
          )}
        </button>
      </form>
    </div>
  );
}
