'use client';

import { MealType } from '@/types/nutrition';

interface MealTypeSelectorProps {
  selected: MealType | null;
  onSelect: (type: MealType) => void;
  mealDate: string;
  onDateChange: (date: string) => void;
  onNext: () => void;
}

const MEAL_TYPE_OPTIONS: {
  type: MealType;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  { type: 'breakfast', emoji: '🌅', label: 'Breakfast', hint: 'Usually 6am – 10am' },
  { type: 'lunch', emoji: '☀️', label: 'Lunch', hint: 'Usually 11am – 2pm' },
  { type: 'dinner', emoji: '🌙', label: 'Dinner', hint: 'Usually 5pm – 9pm' },
  { type: 'snack', emoji: '🍎', label: 'Snack', hint: 'Anytime in between' },
];

export default function MealTypeSelector({
  selected,
  onSelect,
  mealDate,
  onDateChange,
  onNext,
}: MealTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">What meal is this?</h2>
        <p className="text-gray-500 text-sm">Select the meal type you're logging</p>
      </div>

      {/* Date picker */}
      <div>
        <label htmlFor="meal-date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          id="meal-date"
          type="date"
          value={mealDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Meal type grid */}
      <div className="grid grid-cols-2 gap-3">
        {MEAL_TYPE_OPTIONS.map(({ type, emoji, label, hint }) => {
          const isSelected = selected === type;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`rounded-xl p-4 text-left transition-all border-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isSelected
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div
                className={`font-semibold text-base ${
                  isSelected ? 'text-green-700' : 'text-gray-800'
                }`}
              >
                {label}
              </div>
              <div className={`text-xs mt-0.5 ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>
                {hint}
              </div>
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!selected}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
          selected
            ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Next: Add Foods →
      </button>
    </div>
  );
}
