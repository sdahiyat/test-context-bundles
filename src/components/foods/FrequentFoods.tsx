'use client';

import { useFrequentFoods } from '@/hooks/useFoodSearch';
import { Food } from '@/types/food';
import FoodSearchItem from './FoodSearchItem';

interface FrequentFoodsProps {
  onFoodSelect: (food: Food) => void;
  limit?: number;
}

function SkeletonRow() {
  return (
    <div className="px-4 py-3 flex items-center justify-between animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  );
}

export default function FrequentFoods({ onFoodSelect, limit = 5 }: FrequentFoodsProps) {
  const { foods, isLoading, error } = useFrequentFoods(limit);

  return (
    <div>
      <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
        Frequently Logged
      </h3>

      {isLoading && (
        <div>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {!isLoading && error && (
        <p className="px-4 py-3 text-sm text-red-500">{error}</p>
      )}

      {!isLoading && !error && foods.length === 0 && (
        <p className="px-4 py-4 text-sm text-gray-500 text-center">
          Log some meals to see your frequent foods here!
        </p>
      )}

      {!isLoading && !error && foods.length > 0 && (
        <ul role="list">
          {foods.slice(0, limit).map((item) => (
            <li key={item.id} className="border-b border-gray-50 last:border-0">
              <FoodSearchItem
                food={item}
                isSelected={false}
                onClick={() => onFoodSelect(item)}
                badge={
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    ×{item.log_count}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
