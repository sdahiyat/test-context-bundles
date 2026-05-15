'use client'

import { useState, useEffect } from 'react'
import { RecognizedFood, MealType, NutritionTotals } from '@/types/nutrition'
import { v4 as uuidv4 } from 'uuid'

interface RecognitionResultsProps {
  foods: RecognizedFood[]
  imageUrl: string
  onConfirm: (foods: RecognizedFood[], mealType: MealType) => void
  onRetry: () => void
  onManualEntry: () => void
  isLoading: boolean
}

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
]

const UNITS = ['grams', 'oz', 'cups', 'serving', 'piece', 'slice', 'ml', 'tbsp', 'tsp']

export default function RecognitionResults({
  foods,
  imageUrl,
  onConfirm,
  onRetry,
  onManualEntry,
  isLoading,
}: RecognitionResultsProps) {
  const [editableFoods, setEditableFoods] = useState<RecognizedFood[]>([])
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setEditableFoods(foods.map((f) => ({ ...f })))
  }, [foods])

  const totals: NutritionTotals = editableFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const updateFood = (id: string, field: keyof RecognizedFood, value: string | number) => {
    setEditableFoods((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              [field]: typeof value === 'string' && field !== 'name' && field !== 'unit'
                ? parseFloat(value) || 0
                : value,
            }
          : f
      )
    )
  }

  const removeFood = (id: string) => {
    setEditableFoods((prev) => prev.filter((f) => f.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const addBlankFood = () => {
    const newFood: RecognizedFood = {
      id: uuidv4(),
      name: '',
      portion: 100,
      unit: 'grams',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      confidence: 1,
    }
    setEditableFoods((prev) => [...prev, newFood])
    setExpandedId(newFood.id)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
            <span className="text-4xl">🍽️</span>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-xl">Analyzing your food...</p>
          <p className="text-gray-400 text-sm mt-1">AI is identifying ingredients and nutrition</p>
        </div>
        {/* Skeleton rows */}
        <div className="w-full space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-1/3" />
                </div>
                <div className="h-5 bg-gray-700 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Image thumbnail */}
      {imageUrl && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-900">
          <img
            src={imageUrl}
            alt="Analyzed food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Meal type selector */}
      <div>
        <p className="text-gray-400 text-sm mb-2">Meal type</p>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setMealType(type.value)}
              className={`
                flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all text-xs font-medium
                ${mealType === type.value
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }
              `}
            >
              <span className="text-xl">{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Foods list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">
            Identified foods {editableFoods.length > 0 && `(${editableFoods.length})`}
          </p>
          {editableFoods.length === 0 && (
            <span className="text-xs text-yellow-400">No foods detected</span>
          )}
        </div>

        {editableFoods.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-white font-medium mb-1">No foods detected</p>
            <p className="text-gray-400 text-sm mb-4">
              The AI couldn&apos;t identify food in this image. Try a clearer photo or add items manually.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onManualEntry}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Enter Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {editableFoods.map((food) => (
              <div key={food.id} className="bg-gray-800 rounded-xl overflow-hidden">
                {/* Main row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => setExpandedId(expandedId === food.id ? null : food.id)}
                >
                  {/* Confidence indicator */}
                  <div className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${food.confidence >= 0.7 ? 'bg-green-400' : 'bg-yellow-400'}
                  `} />

                  {/* Food name */}
                  <div className="flex-1 min-w-0">
                    <input
                      value={food.name}
                      onChange={(e) => {
                        e.stopPropagation()
                        updateFood(food.id, 'name', e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-white font-medium text-sm w-full outline-none truncate"
                      placeholder="Food name"
                    />
                    {food.confidence < 0.7 && (
                      <span className="text-yellow-400 text-xs">⚠ Low confidence</span>
                    )}
                  </div>

                  {/* Portion inputs */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      value={food.portion}
                      onChange={(e) => updateFood(food.id, 'portion', e.target.value)}
                      className="w-14 bg-gray-700 text-white text-sm rounded-lg px-2 py-1 outline-none text-center"
                      min="0"
                      step="1"
                    />
                    <select
                      value={food.unit}
                      onChange={(e) => updateFood(food.id, 'unit', e.target.value)}
                      className="bg-gray-700 text-white text-xs rounded-lg px-1 py-1 outline-none"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Calories */}
                  <div className="text-right flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      value={food.calories}
                      onChange={(e) => updateFood(food.id, 'calories', e.target.value)}
                      className="w-16 bg-gray-700 text-green-400 text-sm rounded-lg px-2 py-1 outline-none text-center font-medium"
                      min="0"
                    />
                    <p className="text-gray-500 text-xs mt-0.5">kcal</p>
                  </div>

                  {/* Expand chevron */}
                  <svg
                    className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${expandedId === food.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded macros */}
                {expandedId === food.id && (
                  <div className="px-3 pb-3 border-t border-gray-700">
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        { field: 'protein' as const, label: 'Protein', color: 'text-blue-400', unit: 'g' },
                        { field: 'carbs' as const, label: 'Carbs', color: 'text-yellow-400', unit: 'g' },
                        { field: 'fat' as const, label: 'Fat', color: 'text-red-400', unit: 'g' },
                      ].map(({ field, label, color, unit }) => (
                        <div key={field} className="bg-gray-700 rounded-lg p-2">
                          <p className={`text-xs ${color} font-medium mb-1`}>{label}</p>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={food[field]}
                              onChange={(e) => updateFood(food.id, field, e.target.value)}
                              className="w-full bg-transparent text-white text-sm outline-none"
                              min="0"
                              step="0.1"
                            />
                            <span className="text-gray-400 text-xs">{unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => removeFood(food.id)}
                      className="mt-3 w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm py-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add food manually button */}
        <button
          onClick={addBlankFood}
          className="w-full mt-2 flex items-center justify-center gap-2 border border-dashed border-gray-600 hover:border-green-500 text-gray-400 hover:text-green-400 py-3 rounded-xl transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add food manually
        </button>
      </div>

      {/* Nutrition totals */}
      {editableFoods.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm font-medium mb-3">Meal totals</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-green-400 font-bold text-lg">{Math.round(totals.calories)}</p>
              <p className="text-gray-500 text-xs">kcal</p>
            </div>
            <div>
              <p className="text-blue-400 font-bold text-lg">{Math.round(totals.protein * 10) / 10}g</p>
              <p className="text-gray-500 text-xs">protein</p>
            </div>
            <div>
              <p className="text-yellow-400 font-bold text-lg">{Math.round(totals.carbs * 10) / 10}g</p>
              <p className="text-gray-500 text-xs">carbs</p>
            </div>
            <div>
              <p className="text-red-400 font-bold text-lg">{Math.round(totals.fat * 10) / 10}g</p>
              <p className="text-gray-500 text-xs">fat</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {editableFoods.length > 0 && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={onRetry}
            className="flex-1 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
          >
            Retake Photo
          </button>
          <button
            onClick={() => onConfirm(editableFoods, mealType)}
            className="flex-2 flex-grow-[2] py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Confirm & Log Meal
          </button>
        </div>
      )}

      {editableFoods.length === 0 && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={onManualEntry}
            className="flex-1 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            Enter Manually
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
