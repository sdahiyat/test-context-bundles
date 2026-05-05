import InsightsPanel from '@/components/insights/InsightsPanel';

export const metadata = {
  title: 'Nutrition Insights | NutriTrack',
  description: 'AI-powered analysis of your eating habits and personalized nutrition feedback',
};

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Nutrition Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-powered analysis of your eating habits
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <InsightsPanel />
      </div>
    </div>
  );
}
