'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MealWithItems, calculateMealNutrition } from '@/types/nutrition';

interface MealsListProps {
  meals: MealWithItems[];
  onMealDeleted: () => void;
}

const MEAL_TYPE_ORDER: MealWithItems['meal_type'][] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

const MEAL_TYPE_LABELS: Record<MealWithItems['meal_type'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_TYPE_ICONS: Record<MealWithItems['meal_type'], string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

interface MealCardProps {
  meal: MealWithItems;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

function MealCard({ meal, onDelete, isDeleting }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const nutrition = calculateMealNutrition(meal);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Meal Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{MEAL_TYPE_ICONS[meal.meal_type]}</span>
          <div>
            <p className="font-semibold text-gray-800">
              {MEAL_TYPE_LABELS[meal.meal_type]}
            </p>
            <p className="text-xs text-gray-400">
              {meal.meal_items.length} item
              {meal.meal_items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-gray-800">{nutrition.calories}</p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Macro summary row */}
          <div className="px-4 py-2 bg-gray-50 flex gap-4 text-xs text-gray-500">
            <span>
              <span className="font-semibold text-blue-500">P</span>{' '}
              {nutrition.protein}g
            </span>
            <span>
              <span className="font-semibold text-yellow-500">C</span>{' '}
              {nutrition.carbs}g
            </span>
            <span>
              <span className="font-semibold text-red-400">F</span>{' '}
              {nutrition.fat}g
            </span>
          </div>

          {/* Food items */}
          <div className="divide-y divide-gray-50">
            {meal.meal_items.map((item) => {
              const itemGrams =
                item.unit.toLowerCase() === 'g' ||
                item.unit.toLowerCase() === 'grams'
                  ? item.quantity
                  : item.unit.toLowerCase() === 'oz'
                  ? item.quantity * 28.35
                  : item.unit.toLowerCase() === 'cup' ||
                    item.unit.toLowerCase() === 'cups'
                  ? item.quantity * 240
                  : item.quantity * 100;
              const factor = itemGrams / 100;
              const itemCals =
                item.custom_calories !== null
                  ? item.custom_calories
                  : Math.round(item.foods.calories_per_100g * factor);

              return (
                <div
                  key={item.id}
                  className="px-4 py-2.5 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">
                      {item.foods.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 ml-2 flex-shrink-0">
                    {itemCals} kcal
                  </p>
                </div>
              );
            })}
          </div>

          {/* Delete button */}
          <div className="px-4 py-3 flex justify-end border-t border-gray-100">
            <button
              onClick={() => onDelete(meal.id)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {isDeleting ? 'Deleting...' : 'Delete meal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MealsList({ meals, onMealDeleted }: MealsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (mealId: string) => {
    setDeletingId(mealId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete meal');
      }

      onMealDeleted();
    } catch (err) {
      console.error('Delete meal error:', err);
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete meal'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Sort meals by meal type order
  const sortedMeals = [...meals].sort((a, b) => {
    return (
      MEAL_TYPE_ORDER.indexOf(a.meal_type) -
      MEAL_TYPE_ORDER.indexOf(b.meal_type)
    );
  });

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Meals Logged
        </h2>
        <div className="flex items-center gap-2">
          {meals.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {meals.length} meal{meals.length !== 1 ? 's' : ''}
            </span>
          )}
          <Link
            href="/log-meal"
            className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            + Add meal
          </Link>
        </div>
      </div>

      {/* Error message */}
      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {deleteError}
        </div>
      )}

      {/* Empty state */}
      {meals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div className="text-center">
            <p className="text-gray-600 font-semibold">No meals logged yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start tracking your nutrition today
            </p>
          </div>
          <Link
            href="/log-meal"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Log your first meal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onDelete={handleDelete}
              isDeleting={deletingId === meal.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
