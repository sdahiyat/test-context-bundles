import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="text-xl font-bold text-green-800">NutriTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-green-700 hover:text-green-900 font-medium transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <span>✨</span>
          <span>AI-Powered Nutrition Tracking</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Track Your Nutrition{' '}
          <span className="text-green-600">Effortlessly</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Log meals in seconds with AI photo recognition, get personalized insights,
          and achieve your health goals with NutriTrack.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/log-meal"
            className="w-full sm:w-auto bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>🍽️</span>
            Log a Meal
          </Link>
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto bg-white text-green-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-50 transition-colors shadow-md border border-green-200 flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Everything You Need to Succeed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Photo Logging</h3>
            <p className="text-gray-600">
              Simply snap a photo of your meal and our AI instantly identifies foods
              and calculates nutrition facts automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Tracking</h3>
            <p className="text-gray-600">
              Track calories, protein, carbs, and fat with beautiful dashboards
              that show your daily and weekly progress at a glance.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalized Goals</h3>
            <p className="text-gray-600">
              Set custom nutrition goals based on your weight, activity level,
              and objectives — whether losing weight, bulking, or maintaining.
            </p>
          </div>
        </div>
      </section>

      {/* Manual Logging CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-green-600 rounded-3xl p-10 text-center text-white">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-3xl font-bold mb-4">Ready to Start Logging?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Search our food database, pick your portions, and log your meals in under 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/log-meal"
              className="bg-white text-green-700 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors text-lg"
            >
              Log a Meal Now →
            </Link>
            <Link
              href="/dashboard"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} NutriTrack. Made with ❤️ for healthier living.</p>
      </footer>
    </main>
  )
}
