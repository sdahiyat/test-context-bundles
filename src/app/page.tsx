import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-green-600">NutriTrack</div>
        <nav className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-medium bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span>✨</span> AI-Powered Nutrition Tracking
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Track nutrition,
          <br />
          <span className="text-green-500">effortlessly.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Log meals with a photo, get instant calorie breakdowns, and reach your goals faster with
          AI-powered insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg shadow-green-200"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/login"
            className="inline-block bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors border border-gray-200"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Everything you need to hit your goals
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📸"
            title="AI Photo Logging"
            description="Snap a photo of your meal and instantly get accurate calorie and macro breakdowns powered by AI."
          />
          <FeatureCard
            icon="📊"
            title="Smart Tracking"
            description="Daily dashboards with calorie and macro progress bars. Know exactly where you stand at a glance."
          />
          <FeatureCard
            icon="🎯"
            title="Personalized Goals"
            description="Set weight loss, maintenance, or muscle gain goals. Get auto-calculated calorie targets based on your profile."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-green-500 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start tracking today
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Join thousands of users achieving their nutrition goals with NutriTrack.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-green-600 font-semibold px-8 py-3.5 rounded-xl text-lg hover:bg-green-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400">
        © {new Date().getFullYear()} NutriTrack. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
