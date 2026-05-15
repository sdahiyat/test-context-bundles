import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="text-xl font-bold text-white">NutriTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8">
          <span className="text-green-400 text-sm font-medium">✨ AI-Powered Nutrition Tracking</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Track meals in seconds with{' '}
          <span className="text-green-400">AI vision</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Simply take a photo of your food and let AI identify every ingredient, estimate portions, and calculate your nutrition automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Start Tracking Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/log/photo"
            className="w-full sm:w-auto border border-gray-600 hover:border-green-500 text-gray-300 hover:text-green-400 px-8 py-4 rounded-xl text-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Try AI Photo Logging
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to track nutrition
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* AI Photo Logging Feature */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-green-500/50 transition-colors group">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Photo Logging</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Snap a photo of any meal and our AI instantly identifies foods, estimates portions, and calculates full nutritional info.
            </p>
            <Link
              href="/log/photo"
              className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Try it now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Smart Tracking Feature */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 transition-colors group">
            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Tracking</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Track calories, protein, carbs, and fats with real-time updates. Visual progress bars keep your goals in sight all day.
            </p>
            <Link
              href="/dashboard"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Personalized Goals Feature */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/50 transition-colors group">
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalized Goals</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Set custom calorie and macro targets based on your goals — whether that&apos;s weight loss, muscle gain, or maintenance.
            </p>
            <Link
              href="/auth/signup"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Set your goals
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Log a meal in 3 steps</h2>
          <p className="text-gray-400 mb-12">No more manual calorie counting. Just snap, confirm, and go.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                emoji: '📸',
                title: 'Take a photo',
                description: 'Use your camera or upload an existing image of your meal',
              },
              {
                step: '02',
                emoji: '🤖',
                title: 'AI analyzes it',
                description: 'Our AI identifies each food item and estimates portion sizes',
              },
              {
                step: '03',
                emoji: '✅',
                title: 'Confirm & log',
                description: 'Review and adjust the results, then save to your nutrition log',
              },
            ].map(({ step, emoji, title, description }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-3xl">
                  {emoji}
                </div>
                <div className="text-green-400 text-xs font-bold tracking-widest">STEP {step}</div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/log/photo"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              Try AI Photo Logging
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Start tracking smarter today</h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of users who have simplified their nutrition tracking with AI-powered food recognition.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-xl text-xl font-semibold transition-colors"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-gray-500 text-sm mt-4">No credit card required • Free tier available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🥗</span>
          <span className="font-bold text-white">NutriTrack</span>
        </div>
        <p className="text-gray-500 text-sm">AI-powered nutrition tracking for everyone</p>
      </footer>
    </main>
  )
}
