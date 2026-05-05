'use client';

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number | null;
  color: string;
}

function MacroBar({ label, consumed, target, color }: MacroBarProps) {
  const percentage =
    target && target > 0 ? Math.round((consumed / target) * 100) : null;
  const fillWidth =
    percentage !== null ? Math.min(percentage, 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-gray-800">{consumed}g</span>
          {target !== null && (
            <span className="text-xs text-gray-400">/ {target}g</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {label === 'Protein' && 'builds muscle'}
          {label === 'Carbs' && 'energy fuel'}
          {label === 'Fat' && 'essential fats'}
        </span>
        {percentage !== null && (
          <span
            className={`text-xs font-medium ${
              percentage > 100 ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

interface MacroSummarySectionProps {
  protein: number;
  carbs: number;
  fat: number;
  goals: {
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  } | null;
}

export default function MacroSummarySection({
  protein,
  carbs,
  fat,
  goals,
}: MacroSummarySectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 gap-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Macronutrients
      </h2>
      <MacroBar
        label="Protein"
        consumed={protein}
        target={goals?.protein ?? null}
        color="bg-blue-500"
      />
      <MacroBar
        label="Carbs"
        consumed={carbs}
        target={goals?.carbs ?? null}
        color="bg-yellow-400"
      />
      <MacroBar
        label="Fat"
        consumed={fat}
        target={goals?.fat ?? null}
        color="bg-red-400"
      />
    </div>
  );
}
