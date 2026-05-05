import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-emerald-600">NutriTrack</span>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Nutrition tracking,{' '}
          <span className="text-emerald-600">powered by AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Log meals in seconds with AI photo recognition, track your macros
          effortlessly, and get personalized insights to reach your health
          goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3.5 text-base font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition shadow-md"
          >
            Start for free
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 text-base font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition shadow-sm"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          {
            icon: '📸',
            title: 'AI Photo Logging',
            desc: 'Snap a photo of your meal and let AI identify the food and estimate macros instantly.',
          },
          {
            icon: '📊',
            title: 'Smart Tracking',
            desc: 'Track calories, protein, carbs, and fats with a clean daily summary dashboard.',
          },
          {
            icon: '🎯',
            title: 'Personalized Goals',
            desc: 'Set custom weight and nutrition goals and track your progress over time.',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
          >
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
