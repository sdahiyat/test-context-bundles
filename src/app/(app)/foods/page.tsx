'use client';

import { useState } from 'react';
import { Food } from '@/types/food';
import FoodSearch from '@/components/foods/FoodSearch';
import FoodDetail from '@/components/foods/FoodDetail';

export default function FoodsPage() {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Food Database</h1>
          <p className="text-gray-500 mt-1">
            Search thousands of foods or create your own custom entries.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column — Search */}
          <div className="w-full lg:w-1/2 xl:w-2/5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <FoodSearch
                onFoodSelect={(food) => setSelectedFood(food)}
                placeholder="Search foods (e.g. chicken breast, oats…)"
                showRecentAndFrequent
                autoFocus
              />

              {/* Hint when nothing selected */}
              {!selectedFood && (
                <div className="mt-6 text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Search for a food</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Type at least 2 characters to search
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Detail */}
          <div className="w-full lg:w-1/2 xl:w-3/5">
            {selectedFood ? (
              <FoodDetail
                food={selectedFood}
                onClose={() => setSelectedFood(null)}
                showAddButton={false}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full min-h-64 flex items-center justify-center">
                <div className="text-center py-16 px-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400">
                    Select a food to see details
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Nutritional information and macros will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
