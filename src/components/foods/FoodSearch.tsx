'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Food } from '@/types/food';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import FoodSearchItem from './FoodSearchItem';
import RecentFoods from './RecentFoods';
import FrequentFoods from './FrequentFoods';
import CreateFoodModal from './CreateFoodModal';

interface FoodSearchProps {
  onFoodSelect: (food: Food) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showRecentAndFrequent?: boolean;
}

export default function FoodSearch({
  onFoodSelect,
  placeholder = 'Search foods…',
  autoFocus = false,
  showRecentAndFrequent = true,
}: FoodSearchProps) {
  const { query, setQuery, results, isLoading, clearQuery } = useFoodSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (food: Food) => {
      onFoodSelect(food);
      clearQuery();
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    [onFoodSelect, clearQuery]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const showResults = query.length >= 2;
  const showEmpty = isOpen && !showResults && showRecentAndFrequent;
  const showSearchResults = isOpen && showResults;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {isLoading ? (
            <svg className="w-5 h-5 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400"
          aria-label="Search foods"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          role="combobox"
        />
        {query && (
          <button
            type="button"
            onClick={() => { clearQuery(); setIsOpen(true); inputRef.current?.focus(); }}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-40 max-h-96 overflow-y-auto">
          {/* Search Results */}
          {showSearchResults && (
            <>
              {results.length > 0 ? (
                <ul role="listbox" aria-label="Food search results">
                  {results.map((food, idx) => (
                    <li key={food.id} role="option" aria-selected={idx === selectedIndex}>
                      <FoodSearchItem
                        food={food}
                        isSelected={idx === selectedIndex}
                        onClick={() => handleSelect(food)}
                      />
                    </li>
                  ))}
                </ul>
              ) : !isLoading ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500 mb-1">No foods found for &quot;{query}&quot;</p>
                  <p className="text-xs text-gray-400">Try a different search or create a custom food below</p>
                </div>
              ) : null}
            </>
          )}

          {/* Recent + Frequent Foods (when query is empty) */}
          {showEmpty && (
            <>
              <RecentFoods onFoodSelect={handleSelect} limit={5} />
              <FrequentFoods onFoodSelect={handleSelect} limit={5} />
            </>
          )}

          {/* Add custom food footer */}
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add custom food
              {query && ` "${query}"`}
            </button>
          </div>
        </div>
      )}

      {/* Create Food Modal */}
      <CreateFoodModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFoodCreated={(food) => {
          onFoodSelect(food);
          setIsCreateModalOpen(false);
        }}
        prefillName={query}
      />
    </div>
  );
}
