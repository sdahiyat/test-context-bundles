'use client';

import { useState, useEffect, useCallback } from 'react';
import { Food, RecentFoodFlat, FrequentFoodFlat } from '@/types/food';

// ─── useFoodSearch ────────────────────────────────────────────────────────────

interface UseFoodSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: Food[];
  isLoading: boolean;
  error: string | null;
  clearQuery: () => void;
}

export function useFoodSearch(): UseFoodSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/foods/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Search failed');
        }
        const body = await res.json();
        setResults(body.foods ?? []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return { query, setQuery, results, isLoading, error, clearQuery };
}

// ─── useRecentFoods ───────────────────────────────────────────────────────────

interface UseRecentFoodsReturn {
  foods: RecentFoodFlat[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRecentFoods(limit = 20): UseRecentFoodsReturn {
  const [foods, setFoods] = useState<RecentFoodFlat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/foods/recent?limit=${limit}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) return; // not logged in, silently ignore
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load recent foods');
        }
        return res.json();
      })
      .then((body) => {
        if (!cancelled && body) setFoods(body.foods ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [limit, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { foods, isLoading, error, refetch };
}

// ─── useFrequentFoods ─────────────────────────────────────────────────────────

interface UseFrequentFoodsReturn {
  foods: FrequentFoodFlat[];
  isLoading: boolean;
  error: string | null;
}

export function useFrequentFoods(limit = 10): UseFrequentFoodsReturn {
  const [foods, setFoods] = useState<FrequentFoodFlat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/foods/frequent?limit=${limit}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) return;
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Failed to load frequent foods');
        }
        return res.json();
      })
      .then((body) => {
        if (!cancelled && body) setFoods(body.foods ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [limit]);

  return { foods, isLoading, error };
}
