'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CaloriePoint {
  date: string;
  calories: number;
}

interface CalorieHistoryChartProps {
  data: CaloriePoint[];
  goalCalories: number;
  days: number;
}

function formatDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  if (days <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-indigo-600">
          {payload[0].value.toLocaleString()} kcal
        </p>
      </div>
    );
  }
  return null;
}

export default function CalorieHistoryChart({
  data,
  goalCalories,
  days,
}: CalorieHistoryChartProps) {
  const hasData = data.some((d) => d.calories > 0);

  // Filter out leading/trailing zero days for cleaner display when days > 7
  const displayData = data.map((d) => ({
    ...d,
    displayDate: formatDate(d.date, days),
  }));

  // For large ranges, tick every N days to avoid crowding
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 13;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Calorie History</h2>
        {hasData && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-3 h-3 bg-indigo-500 rounded-sm" />
            <span>Calories</span>
            <span className="inline-block w-6 border-t-2 border-dashed border-emerald-500 ml-2" />
            <span>Goal</span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">📊</p>
            <p className="text-gray-500 font-medium">No data yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start logging meals to see your calorie history!
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
              <ReferenceLine
                y={goalCalories}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{
                  value: 'Goal',
                  fill: '#10b981',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
              <Bar
                dataKey="calories"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
                name="Calories"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
