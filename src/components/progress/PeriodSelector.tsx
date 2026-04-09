'use client';

interface PeriodSelectorProps {
  value: 7 | 30 | 90;
  onChange: (days: 7 | 30 | 90) => void;
}

const periods: { label: string; value: 7 | 30 | 90 }[] = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg" role="group" aria-label="Select time period">
      {periods.map((period) => {
        const isActive = value === period.value;
        return (
          <button
            key={period.value}
            onClick={() => onChange(period.value)}
            aria-pressed={isActive}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
