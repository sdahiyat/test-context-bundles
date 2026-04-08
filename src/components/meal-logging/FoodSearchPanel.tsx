'use client';

import { useState, useEffect, useRef } from 'react';
import { Food, PendingMealItem, PortionUnit, PORTION_UNITS, calculateNutritionForPortion } from '@/types/nutrition';

interface FoodSearchPanelProps {
  onAddItem: (item: PendingMealItem) => void;
}

export default function FoodSearchPanel({ onAddItem }: FoodSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState<PortionUnit>('g');
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoods(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchFoods(q: string) {
    setIsSearching(true);
    try {
      const url = q.trim()
        ? `/api/foods/search?q=${encodeURIComponent(q)}`
        : '/api/foods/search';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectFood(food: Food) {
    setSelectedFood(food);
    setQuery(food.name);
    setShowDropdown(false);
    setQuantity('100');
    setUnit('g');
  }

  function handleClearFood() {
    setSelectedFood(null);
    setQuery('');
    setSearchResults([]);
  }

  const calculatedNutrition =
    selectedFood && quantity && parseFloat(quantity) > 0
      ? calculateNutritionForPortion(selectedFood, parseFloat(quantity), unit)
      : null;

  function handleAddItem() {
    if (!selectedFood || !quantity || parseFloat(quantity) <= 0 || !calculatedNutrition) return;

    onAddItem({
      food: selectedFood,
      quantity: parseFloat(quantity),
      unit,
      calories: calculatedNutrition.calories,
      protein: calculatedNutrition.protein,
      carbs: calculatedNutrition.carbs,
      fat: calculatedNutrition.fat,
    });

    // Reset
    setSelectedFood(null);
    setQuery('');
    setQuantity('100');
    setUnit('g');
    setSearchResults([]);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">Add Food</h3>

      {/* Search input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a food..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedFood && e.target.value !== selectedFood.name) {
                setSelectedFood(null);
              }
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
              else fetchFoods(query);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-2 top-2.5">
              <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isSearching && query && (
            <button
              onClick={handleClearFood}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && searchResults.length > 0 && !selectedFood && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((food) => (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className="w-full text-left px-3 py-2.5 hover:bg-green-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <div className="font-medium text-sm text-gray-800">{food.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {food.calories_per_100g} cal · {food.protein_per_100g}g protein · {food.carbs_per_100g}g carbs · {food.fat_per_100g}g fat per 100g
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchResults.length === 0 && query.trim() && !isSearching && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500">
            No foods found for &quot;{query}&quot;
          </div>
        )}
      </div>

      {/* Selected food info */}
      {selectedFood && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium text-green-800 text-sm">{selectedFood.name}</div>
              <div className="text-xs text-green-600 mt-0.5">
                Per 100g: {selectedFood.calories_per_100g} cal · P: {selectedFood.protein_per_100g}g · C: {selectedFood.carbs_per_100g}g · F: {selectedFood.fat_per_100g}g
              </div>
            </div>
            <button
              onClick={handleClearFood}
              className="text-green-600 hover:text-green-800 text-xs ml-2 mt-0.5"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Portion inputs */}
      {selectedFood && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as PortionUnit)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {PORTION_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u === 'serving' ? `serving (${selectedFood.serving_size_g}g)` : u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nutrition preview */}
          {calculatedNutrition && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-2">Nutrition for this portion:</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-base font-bold text-gray-800">{Math.round(calculatedNutrition.calories)}</div>
                  <div className="text-xs text-gray-500">cal</div>
                </div>
                <div>
                  <div className="text-base font-bold text-blue-600">{calculatedNutrition.protein}g</div>
                  <div className="text-xs text-gray-500">protein</div>
                </div>
                <div>
                  <div className="text-base font-bold text-yellow-600">{calculatedNutrition.carbs}g</div>
                  <div className="text-xs text-gray-500">carbs</div>
                </div>
                <div>
                  <div className="text-base font-bold text-red-500">{calculatedNutrition.fat}g</div>
                  <div className="text-xs text-gray-500">fat</div>
                </div>
              </div>
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAddItem}
            disabled={!calculatedNutrition || parseFloat(quantity) <= 0}
            className="w-full py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            + Add to Meal
          </button>
        </div>
      )}
    </div>
  );
}
