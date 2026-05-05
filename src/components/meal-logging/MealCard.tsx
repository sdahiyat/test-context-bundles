'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Meal, MealType } from '@/types/nutrition';

interface MealCardProps {
  meal: Meal;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

const MEAL_TYPE_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: 'bg-yellow-50 border-yellow-200',
  lunch: 'bg-blue-50 border-blue-200',
  dinner: 'bg-indigo-50 border-indigo-200',
  snack: 'bg-green-50 border-green-200',
};

const MEAL_TYPE_HEADER_COLORS: Record<MealType, string> = {
  breakfast: 'bg-yellow-100 text-yellow-800',
  lunch: 'bg-blue-100 text-blue-800',
  dinner: 'bg-indigo-100 text-indigo-800',
  snack: 'bg-green-100 text-green-800',
};

export default function MealCard({ meal, onDelete, onEdit }: MealCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalCalories = meal.items?.reduce((sum, item) => sum + item.calories, 0) ?? 0;
  const mealType = meal.meal_type as MealType;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(meal.id);
      } else {
        console.error('Failed to delete meal');
        setIsDeleting(false);
        setIsConfirmingDelete(false);
      }
    } catch (err) {
      console.error('Error deleting meal:', err);
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  }

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${MEAL_TYPE_COLORS[mealType]}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${MEAL_TYPE_HEADER_COLORS[mealType]}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{MEAL_TYPE_ICONS[mealType]}</span>
          <span className="font-semibold capitalize">{meal.meal_type}</span>
        </div>
        <div className="text-xl font-bold">
          {Math.round(totalCalories)} <span className="text-sm font-normal">cal</span>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5">
        {meal.items && meal.items.length > 0 ? (
          meal.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">{item.food?.name || 'Unknown food'}</span>
              <span className="text-gray-500 text-xs">
                {item.quantity}{item.unit === 'serving' ? ' serving' : item.unit} · {Math.round(item.calories)} cal
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No items</p>
        )}

        {meal.notes && (
          <p className="text-xs text-gray-500 italic mt-2 pt-2 border-t border-gray-200">
            {meal.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-gray-200/60 flex items-center justify-between">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-gray-600 flex-1">Delete this meal?</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <Link
              href={`/log-meal/${meal.id}/edit`}
              onClick={() => onEdit?.(meal.id)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
