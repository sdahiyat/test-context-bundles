import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header / Nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <span className="text-xl font-bold text-gray-900">NutriTrack</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span>✨</span>
            <span>AI-Powered Nutrition Tracking</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Track Nutrition.{' '}
            <span className="text-green-600">Effortlessly.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Log meals in seconds with AI photo recognition. Get personalized
            insights to hit your goals. No more guesswork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Open Dashboard →
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Everything you need to eat better
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                📸
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                AI Photo Logging
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Snap a photo of your meal and let AI identify foods and estimate
                calories automatically. Edit results for accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Smart Tracking
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Visual progress rings, macro breakdowns, and daily summaries
                keep you on track toward your goals every day.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Personalized Goals
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Set custom calorie and macro targets based on your goal — weight
                loss, maintenance, or muscle gain.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-10 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to start tracking?
            </h2>
            <p className="text-green-100 mb-8 max-w-lg mx-auto">
              Join thousands of users who have improved their nutrition with
              NutriTrack.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-white text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl font-bold transition-colors"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto border border-white/40 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>🥗</span>
              <span className="font-semibold">NutriTrack</span>
            </div>
            <p>© {new Date().getFullYear()} NutriTrack. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
