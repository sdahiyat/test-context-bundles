'use client';

interface MacroDistributionChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

interface Segment {
  label: string;
  calories: number;
  grams: number;
  color: string;
  hexColor: string;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  // Clamp to avoid full-circle rendering issues
  const clampedEnd = Math.min(endAngle, startAngle + 359.99);

  const outerStart = polarToCartesian(cx, cy, outerR, clampedEnd);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, clampedEnd);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArcFlag = clampedEnd - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export default function MacroDistributionChart({
  protein,
  carbs,
  fat,
}: MacroDistributionChartProps) {
  const cx = 100;
  const cy = 100;
  const outerR = 75;
  const innerR = 50;

  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const total = proteinCals + carbsCals + fatCals;

  const segments: Segment[] = [
    {
      label: 'Protein',
      calories: proteinCals,
      grams: protein,
      color: 'bg-blue-500',
      hexColor: '#3b82f6',
    },
    {
      label: 'Carbs',
      calories: carbsCals,
      grams: carbs,
      color: 'bg-yellow-400',
      hexColor: '#facc15',
    },
    {
      label: 'Fat',
      calories: fatCals,
      grams: fat,
      color: 'bg-red-400',
      hexColor: '#f87171',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Macro Distribution
      </h2>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="25"
            />
          </svg>
          <p className="text-gray-400 text-sm">No data logged yet</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {(() => {
              let currentAngle = 0;
              return segments.map((seg) => {
                const fraction = seg.calories / total;
                const sweep = fraction * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + sweep;
                currentAngle = endAngle;

                if (sweep < 0.1) return null;

                const d = describeArc(
                  cx,
                  cy,
                  outerR,
                  innerR,
                  startAngle,
                  endAngle
                );

                return (
                  <path
                    key={seg.label}
                    d={d}
                    fill={seg.hexColor}
                    opacity={0.9}
                  />
                );
              });
            })()}
            {/* Center label */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              className="text-xs"
              fontSize="12"
              fill="#6b7280"
            >
              Total
            </text>
            <text
              x={cx}
              y={cy + 10}
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#1f2937"
            >
              {Math.round(total)}
            </text>
            <text
              x={cx}
              y={cy + 24}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              kcal
            </text>
          </svg>

          {/* Legend */}
          <div className="w-full grid grid-cols-3 gap-2">
            {segments.map((seg) => {
              const pct =
                total > 0 ? Math.round((seg.calories / total) * 100) : 0;
              return (
                <div key={seg.label} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: seg.hexColor }}
                    />
                    <span className="text-xs text-gray-600">{seg.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {seg.grams}g
                  </span>
                  <span className="text-xs text-gray-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
