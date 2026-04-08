'use client';

import { useRecentFoods } from '@/hooks/useFoodSearch';
import { Food } from '@/types/food';
import FoodSearchItem from './FoodSearchItem';

interface RecentFoodsProps {
  onFoodSelect: (food: Food) => void;
  limit?: number;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
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

export default function RecentFoods({ onFoodSelect, limit = 5 }: RecentFoodsProps) {
  const { foods, isLoading, error } = useRecentFoods(limit);

  return (
    <div>
      <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
        Recently Logged
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
          No recent foods yet. Start logging meals!
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
                  item.last_logged_at ? (
                    <span className="text-xs text-gray-400">
                      {timeAgo(item.last_logged_at)}
                    </span>
                  ) : null
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
