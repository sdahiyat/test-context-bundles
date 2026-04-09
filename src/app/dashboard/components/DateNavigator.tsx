'use client';

interface DateNavigatorProps {
  currentDate: string;
  onPrev: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
}

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA');
}

export default function DateNavigator({
  currentDate,
  onPrev,
  onNext,
  isNextDisabled,
}: DateNavigatorProps) {
  const isToday = currentDate === getTodayDateString();

  const displayDate = isToday
    ? 'Today'
    : new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(currentDate + 'T00:00:00Z'));

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-6 py-4">
      <button
        onClick={onPrev}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
        aria-label="Previous day"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800">{displayDate}</p>
        {!isToday && (
          <p className="text-xs text-gray-400 mt-0.5">{currentDate}</p>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        aria-disabled={isNextDisabled}
        className={`p-2 rounded-full transition-colors ${
          isNextDisabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Next day"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
