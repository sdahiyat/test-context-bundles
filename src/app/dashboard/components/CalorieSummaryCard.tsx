'use client';

interface CalorieSummaryCardProps {
  consumed: number;
  target: number | null;
  remaining: number | null;
}

export default function CalorieSummaryCard({
  consumed,
  target,
  remaining,
}: CalorieSummaryCardProps) {
  const radius = 54;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const size = (radius + strokeWidth) * 2;

  let fillOffset = circumference; // default: no fill
  if (target && target > 0) {
    const fraction = Math.min(consumed / target, 1);
    fillOffset = circumference - fraction * circumference;
  }

  const isOverTarget =
    remaining !== null && remaining < 0;
  const remainingAbs = remaining !== null ? Math.abs(remaining) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Calories
      </h2>

      {/* Circular Progress Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Progress fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isOverTarget ? '#ef4444' : '#22c55e'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={fillOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">
            {consumed.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">kcal</span>
        </div>
      </div>

      {/* Target label */}
      {target !== null && (
        <p className="text-sm text-gray-500">
          of{' '}
          <span className="font-semibold text-gray-700">
            {target.toLocaleString()}
          </span>{' '}
          kcal goal
        </p>
      )}

      {/* Remaining badge */}
      {remaining !== null && (
        <div
          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
            isOverTarget
              ? 'bg-red-50 text-red-600'
              : 'bg-green-50 text-green-600'
          }`}
        >
          {isOverTarget
            ? `${remainingAbs?.toLocaleString()} kcal over`
            : `${remaining.toLocaleString()} kcal remaining`}
        </div>
      )}

      {remaining === null && target === null && (
        <p className="text-xs text-gray-400">Set a goal to track progress</p>
      )}
    </div>
  );
}
