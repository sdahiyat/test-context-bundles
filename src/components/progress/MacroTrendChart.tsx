'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MacroPoint {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroTrendChartProps {
  data: MacroPoint[];
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
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 capitalize">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {entry.value}g
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function MacroTrendChart({ data, days }: MacroTrendChartProps) {
  const hasData = data.some((d) => d.protein > 0 || d.carbs > 0 || d.fat > 0);

  const displayData = data.map((d) => ({
    ...d,
    displayDate: formatDate(d.date, days),
  }));

  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 13;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Macro Trends</h2>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">📈</p>
            <p className="text-gray-500 font-medium">No data yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start logging meals to see your macro trends!
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
                tickFormatter={(v) => `${v}g`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                formatter={(value) => (
                  <span className="capitalize text-gray-600">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="protein"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={days <= 7 ? { fill: '#3b82f6', r: 4 } : false}
                activeDot={{ r: 5, fill: '#3b82f6' }}
                name="protein"
              />
              <Line
                type="monotone"
                dataKey="carbs"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={days <= 7 ? { fill: '#f59e0b', r: 4 } : false}
                activeDot={{ r: 5, fill: '#f59e0b' }}
                name="carbs"
              />
              <Line
                type="monotone"
                dataKey="fat"
                stroke="#ef4444"
                strokeWidth={2}
                dot={days <= 7 ? { fill: '#ef4444', r: 4 } : false}
                activeDot={{ r: 5, fill: '#ef4444' }}
                name="fat"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
