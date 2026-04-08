'use client';

import { MealType, PendingMealItem, getMealTotals } from '@/types/nutrition';

const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

interface MealConfirmationProps {
  mealType: MealType;
  mealDate: string;
  items: PendingMealItem[];
  notes: string;
  onNotesChange: (notes: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
}

export default function MealConfirmation({
  mealType,
  mealDate,
  items,
  notes,
  onNotesChange,
  onBack,
  onSubmit,
  isSubmitting,
  error,
}: MealConfirmationProps) {
  const totals = getMealTotals(items);

  const formattedDate = new Date(mealDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Meal header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{MEAL_TYPE_ICONS[mealType]}</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 capitalize">{mealType}</h2>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Macro totals */}
      <div className="bg-green-600 rounded-xl p-4 text-white">
        <div className="text-center mb-3">
          <div className="text-4xl font-bold">{Math.round(totals.calories)}</div>
          <div className="text-green-200 text-sm">total calories</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/10 rounded-lg py-2 px-1">
            <div className="text-lg font-semibold">{totals.protein.toFixed(1)}g</div>
            <div className="text-green-200 text-xs">protein</div>
          </div>
          <div className="bg-white/10 rounded-lg py-2 px-1">
            <div className="text-lg font-semibold">{totals.carbs.toFixed(1)}g</div>
            <div className="text-green-200 text-xs">carbs</div>
          </div>
          <div className="bg-white/10 rounded-lg py-2 px-1">
            <div className="text-lg font-semibold">{totals.fat.toFixed(1)}g</div>
            <div className="text-green-200 text-xs">fat</div>
          </div>
        </div>
      </div>

      {/* Food items list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Food Items ({items.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="px-4 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm text-gray-800">{item.food.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.quantity} {item.unit === 'serving' ? 'serving' : item.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-gray-800">{Math.round(item.calories)} cal</div>
                  <div className="text-xs text-gray-500">
                    P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any notes about this meal..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Meal ✓'
          )}
        </button>
      </div>
    </div>
  );
}
