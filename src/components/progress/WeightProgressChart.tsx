'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface WeightPoint {
  date: string;
  weight_kg: number;
}

interface WeightProgressChartProps {
  data: WeightPoint[];
  goalWeight?: number | null;
  unit: 'kg' | 'lbs';
}

function convertWeight(weight_kg: number, unit: 'kg' | 'lbs'): number {
  if (unit === 'lbs') {
    return Math.round(weight_kg * 2.20462 * 10) / 10;
  }
  return weight_kg;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  unit: 'kg' | 'lbs';
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-purple-600">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
}

export default function WeightProgressChart({
  data,
  goalWeight,
  unit,
}: WeightProgressChartProps) {
  const hasData = data.length > 0;

  const displayData = data.map((d) => ({
    displayDate: formatDate(d.date),
    weight: convertWeight(d.weight_kg, unit),
  }));

  const convertedGoal = goalWeight ? convertWeight(goalWeight, unit) : undefined;

  // Compute Y axis domain with padding
  const weights = displayData.map((d) => d.weight);
  if (convertedGoal) weights.push(convertedGoal);
  const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 100;
  const padding = Math.max((maxWeight - minWeight) * 0.1, 2);
  const yDomain = [
    Math.floor(minWeight - padding),
    Math.ceil(maxWeight + padding),
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Weight Progress</h2>
        {hasData && convertedGoal && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-6 border-t-2 border-dashed border-emerald-500" />
            <span>Goal</span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">⚖️</p>
            <p className="text-gray-500 font-medium">No weight data yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Log your weight below to track your progress!
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
                interval={Math.max(0, Math.floor(displayData.length / 6) - 1)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}${unit}`}
                domain={yDomain}
                width={50}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              {convertedGoal && (
                <ReferenceLine
                  y={convertedGoal}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: `Goal: ${convertedGoal}${unit}`,
                    fill: '#10b981',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }}
                name={`Weight (${unit})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
