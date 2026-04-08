'use client';

import { Food } from '@/types/food';

interface FoodSearchItemProps {
  food: Food;
  isSelected: boolean;
  onClick: () => void;
  showMacros?: boolean;
  badge?: React.ReactNode;
}

export default function FoodSearchItem({
  food,
  isSelected,
  onClick,
  showMacros = false,
  badge,
}: FoodSearchItemProps) {
  const calories = Math.round(
    (food.calories_per_100g * food.serving_size_g) / 100
  );

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
        isSelected
          ? 'bg-emerald-50 border-l-2 border-emerald-500'
          : 'hover:bg-gray-50 border-l-2 border-transparent'
      }`}
    >
      {/* Left: name + brand */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{food.name}</p>
        {food.brand && (
          <p className="text-sm text-gray-500 truncate">{food.brand}</p>
        )}
        {showMacros && (
          <div className="flex gap-2 mt-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
              P {Math.round((food.protein_per_100g * food.serving_size_g) / 100)}g
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
              C {Math.round((food.carbs_per_100g * food.serving_size_g) / 100)}g
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">
              F {Math.round((food.fat_per_100g * food.serving_size_g) / 100)}g
            </span>
          </div>
        )}
      </div>

      {/* Right: calories + optional badge */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-sm font-semibold text-gray-700">
          {calories} kcal
        </span>
        <span className="text-xs text-gray-400">{food.serving_size_label}</span>
        {badge && badge}
      </div>
    </button>
  );
}
