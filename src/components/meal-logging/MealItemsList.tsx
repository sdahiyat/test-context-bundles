'use client';

import { PendingMealItem, getMealTotals } from '@/types/nutrition';

interface MealItemsListProps {
  items: PendingMealItem[];
  onRemove: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function MealItemsList({ items, onRemove, onBack, onNext }: MealItemsListProps) {
  const totals = getMealTotals(items);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">
          Meal Items {items.length > 0 && <span className="text-green-600">({items.length})</span>}
        </h3>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-gray-500 text-sm font-medium">No items added yet</p>
          <p className="text-gray-400 text-xs mt-1">Search for foods above and add them here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-800 truncate">{item.food.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.quantity}
                  {item.unit === 'serving' ? ' serving' : item.unit} ·{' '}
                  <span className="text-gray-700 font-medium">{Math.round(item.calories)} cal</span>
                  {' · '}P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                </div>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div className="bg-green-50 border-t border-green-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-800">Total</span>
            <div className="flex gap-4 text-right">
              <div className="text-center">
                <div className="text-base font-bold text-gray-800">{Math.round(totals.calories)}</div>
                <div className="text-xs text-gray-500">cal</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">{totals.protein.toFixed(1)}g</div>
                <div className="text-xs text-gray-500">protein</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-yellow-600">{totals.carbs.toFixed(1)}g</div>
                <div className="text-xs text-gray-500">carbs</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-red-500">{totals.fat.toFixed(1)}g</div>
                <div className="text-xs text-gray-500">fat</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 px-4 py-3 border-t border-gray-100">
        <button
          onClick={onBack}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={items.length === 0}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            items.length > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Review Meal →
        </button>
      </div>
    </div>
  );
}
