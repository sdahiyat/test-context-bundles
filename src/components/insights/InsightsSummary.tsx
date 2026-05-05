'use client';

interface InsightsSummaryProps {
  summary: string;
  generatedAt: string;
  periodDays: number;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default function InsightsSummary({
  summary,
  generatedAt,
  periodDays,
}: InsightsSummaryProps) {
  const relativeTime = getRelativeTime(generatedAt);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm">
      {/* Gradient Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">✨</span>
          <h2 className="text-lg font-bold">Your Nutrition Insights</h2>
        </div>
        <p className="text-emerald-100 text-sm">
          Based on the last {periodDays} days of your meal history
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-2xl px-5 py-4">
        <p className="text-gray-700 leading-relaxed text-sm">{summary}</p>
        <p className="mt-3 text-xs text-gray-400">Last updated: {relativeTime}</p>
      </div>
    </div>
  );
}
