'use client';

import { useState, useMemo } from 'react';
import { Food, calculateNutrition } from '@/types/food';

interface FoodDetailProps {
  food: Food;
  onClose?: () => void;
  onAddToMeal?: (food: Food, quantity_g: number, servings: number) => void;
  showAddButton?: boolean;
}

export default function FoodDetail({
  food,
  onClose,
  onAddToMeal,
  showAddButton = false,
}: FoodDetailProps) {
  const [inputMode, setInputMode] = useState<'grams' | 'servings'>('servings');
  const [grams, setGrams] = useState(food.serving_size_g);
  const [servings, setServings] = useState(1);

  const quantityG = inputMode === 'grams' ? grams : servings * food.serving_size_g;

  const nutrition = useMemo(
    () => calculateNutrition(food, quantityG),
    [food, quantityG]
  );

  const totalMacroG = nutrition.protein + nutrition.carbs + nutrition.fat;
  const proteinPct = totalMacroG > 0 ? (nutrition.protein / totalMacroG) * 100 : 0;
  const carbsPct = totalMacroG > 0 ? (nutrition.carbs / totalMacroG) * 100 : 0;
  const fatPct = totalMacroG > 0 ? (nutrition.fat / totalMacroG) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{food.name}</h2>
          {food.brand && <p className="text-sm text-gray-500 mt-0.5">{food.brand}</p>}
          {food.is_custom && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mt-1">
              Custom Food
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Portion Selector */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-gray-700">Portion size:</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            <button
              onClick={() => setInputMode('servings')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                inputMode === 'servings'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Servings
            </button>
            <button
              onClick={() => setInputMode('grams')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                inputMode === 'grams'
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Grams
            </button>
          </div>
        </div>

        {inputMode === 'servings' ? (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">
              Servings ({food.serving_size_label}):
            </label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(Math.max(0, parseFloat(e.target.value) || 0))}
              min={0}
              step={0.25}
              className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-500">
              = {Math.round(quantityG)}g
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Weight (g):</label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(Math.max(0, parseFloat(e.target.value) || 0))}
              min={0}
              step={1}
              className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Calorie Summary */}
      <div className="px-6 py-5 text-center border-b border-gray-100">
        <p className="text-5xl font-bold text-gray-900">
          {Math.round(nutrition.calories)}
        </p>
        <p className="text-sm text-gray-500 mt-1">kilocalories</p>
      </div>

      {/* Macro Bars */}
      <div className="px-6 py-4 space-y-3 border-b border-gray-100">
        {/* Protein */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-blue-700">Protein</span>
            <span className="text-gray-700">{nutrition.protein}g</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-amber-600">Carbohydrates</span>
            <span className="text-gray-700">{nutrition.carbs}g</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-rose-600">Fat</span>
            <span className="text-gray-700">{nutrition.fat}g</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all"
              style={{ width: `${fatPct}%` }}
            />
          </div>
        </div>

        {nutrition.fiber != null && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-green-600">Fiber</span>
              <span className="text-gray-700">{nutrition.fiber}g</span>
            </div>
          </div>
        )}
      </div>

      {/* Full Nutrition Table */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nutrition Facts</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="text-left pb-2 font-medium">Nutrient</th>
              <th className="text-right pb-2 font-medium">Per 100g</th>
              <th className="text-right pb-2 font-medium">Per serving</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="py-2 text-gray-700">Calories</td>
              <td className="py-2 text-right text-gray-900">{food.calories_per_100g} kcal</td>
              <td className="py-2 text-right text-gray-900">{Math.round(nutrition.calories)} kcal</td>
            </tr>
            <tr>
              <td className="py-2 text-blue-700 font-medium">Protein</td>
              <td className="py-2 text-right text-gray-900">{food.protein_per_100g}g</td>
              <td className="py-2 text-right text-gray-900">{nutrition.protein}g</td>
            </tr>
            <tr>
              <td className="py-2 text-amber-600 font-medium">Carbohydrates</td>
              <td className="py-2 text-right text-gray-900">{food.carbs_per_100g}g</td>
              <td className="py-2 text-right text-gray-900">{nutrition.carbs}g</td>
            </tr>
            <tr>
              <td className="py-2 text-rose-600 font-medium">Fat</td>
              <td className="py-2 text-right text-gray-900">{food.fat_per_100g}g</td>
              <td className="py-2 text-right text-gray-900">{nutrition.fat}g</td>
            </tr>
            {food.fiber_per_100g != null && (
              <tr>
                <td className="py-2 text-green-600 font-medium">Fiber</td>
                <td className="py-2 text-right text-gray-900">{food.fiber_per_100g}g</td>
                <td className="py-2 text-right text-gray-900">{nutrition.fiber ?? 0}g</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add to Meal Button */}
      {showAddButton && onAddToMeal && (
        <div className="px-6 py-4">
          <button
            onClick={() => onAddToMeal(food, quantityG, inputMode === 'servings' ? servings : quantityG / food.serving_size_g)}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            Add to Meal
          </button>
        </div>
      )}
    </div>
  );
}
