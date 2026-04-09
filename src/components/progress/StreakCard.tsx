interface WeeklyAverages {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface StreakCardProps {
  streak: number;
  weeklyAverages: WeeklyAverages;
}

interface StatBoxProps {
  label: string;
  value: string;
  unit: string;
  color: string;
}

function StatBox({ label, value, unit, color }: StatBoxProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  );
}

export default function StreakCard({ streak, weeklyAverages }: StreakCardProps) {
  const streakMessage =
    streak === 0
      ? 'Start logging to build your streak!'
      : streak === 1
      ? '1 day — keep it going!'
      : `${streak} days — great consistency!`;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Streak Section */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label="fire">
            🔥
          </span>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Logging Streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{streak}</span>
              <span className="text-lg text-gray-600">{streak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 ml-2">{streakMessage}</p>
      </div>

      {/* Weekly Averages */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Period Averages (logged days)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox
            label="Avg Calories"
            value={weeklyAverages.calories.toLocaleString()}
            unit="kcal"
            color="text-indigo-600"
          />
          <StatBox
            label="Avg Protein"
            value={weeklyAverages.protein.toString()}
            unit="g"
            color="text-blue-600"
          />
          <StatBox
            label="Avg Carbs"
            value={weeklyAverages.carbs.toString()}
            unit="g"
            color="text-amber-600"
          />
          <StatBox
            label="Avg Fat"
            value={weeklyAverages.fat.toString()}
            unit="g"
            color="text-red-500"
          />
        </div>
      </div>
    </div>
  );
}
