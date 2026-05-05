'use client';

import { useState, useEffect, useCallback } from 'react';
import InsightsSummary from './InsightsSummary';
import InsightsCard from './InsightsCard';

interface InsightPattern {
  type: string;
  description: string;
  severity: 'positive' | 'warning' | 'info';
}

interface InsightSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface InsightResult {
  id: string;
  summary: string;
  patterns: InsightPattern[];
  suggestions: InsightSuggestion[];
  generatedAt: string;
  periodDays: number;
}

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Summary skeleton */}
      <div className="rounded-2xl overflow-hidden">
        <div className="h-20 bg-emerald-200 rounded-t-2xl" />
        <div className="bg-gray-100 border border-gray-200 border-t-0 rounded-b-2xl p-4 space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-4/5" />
          <div className="h-3 bg-gray-300 rounded w-3/5" />
        </div>
      </div>

      {/* Pattern skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-36" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-4 flex gap-3">
            <div className="h-9 w-9 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion skeletons */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-40" />
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-4 flex gap-3">
            <div className="h-9 w-9 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getHoursUntilNextRegen(nextAvailableAt?: string): number {
  if (!nextAvailableAt) return 6;
  const next = new Date(nextAvailableAt);
  const now = new Date();
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60));
}

export default function InsightsPanel() {
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | undefined>(undefined);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/insights');
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view your insights.');
        } else {
          setError('Failed to load insights. Please try again.');
        }
        return;
      }
      const data = await res.json();
      setInsight(data.insight);
      setCanRegenerate(data.canRegenerate);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRegenerate = async () => {
    if (!canRegenerate || regenerating) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/insights/regenerate', { method: 'POST' });
      if (res.status === 429) {
        const data = await res.json();
        setCanRegenerate(false);
        setNextAvailableAt(data.nextAvailableAt);
        return;
      }
      if (!res.ok) {
        setError('Failed to regenerate insights. Please try again.');
        return;
      }
      const data = await res.json();
      setInsight(data.insight);
      setCanRegenerate(false);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error && !insight) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
        <div className="text-3xl mb-2">😕</div>
        <h3 className="font-semibold text-red-800 mb-1">Unable to Load Insights</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchInsights}
          className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">🥗</div>
        <h3 className="font-semibold text-gray-800 mb-2">No Insights Yet</h3>
        <p className="text-sm text-gray-500">
          Start logging meals to receive personalized nutrition insights.
        </p>
      </div>
    );
  }

  const hoursUntil = getHoursUntilNextRegen(nextAvailableAt);

  return (
    <div className="space-y-6 pb-20">
      {/* Summary */}
      <InsightsSummary
        summary={insight.summary}
        generatedAt={insight.generatedAt}
        periodDays={insight.periodDays}
      />

      {/* Error banner (non-fatal) */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Detected Patterns */}
      {insight.patterns && insight.patterns.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span>🔍</span> Detected Patterns
          </h2>
          {insight.patterns.map((pattern, idx) => (
            <InsightsCard
              key={idx}
              type="pattern"
              title={pattern.type
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              description={pattern.description}
              severity={pattern.severity}
            />
          ))}
        </div>
      )}

      {/* Suggestions */}
      {insight.suggestions && insight.suggestions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span>💡</span> Suggestions for You
          </h2>
          {insight.suggestions.map((suggestion, idx) => (
            <InsightsCard
              key={idx}
              type="suggestion"
              title={suggestion.title}
              description={suggestion.description}
              priority={suggestion.priority}
            />
          ))}
        </div>
      )}

      {/* Regenerate Button */}
      <div className="pt-2">
        <button
          onClick={handleRegenerate}
          disabled={!canRegenerate || regenerating}
          title={
            !canRegenerate
              ? `Available in ${hoursUntil} hour${hoursUntil === 1 ? '' : 's'}`
              : 'Refresh your insights'
          }
          className={`w-full rounded-xl py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            canRegenerate && !regenerating
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {regenerating ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating insights...
            </>
          ) : canRegenerate ? (
            <>
              <span>🔄</span> Refresh Insights
            </>
          ) : (
            <>
              <span>⏰</span> Available in {hoursUntil} hour{hoursUntil === 1 ? '' : 's'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
