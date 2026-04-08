export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            NutriTrack
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            AI-powered nutrition tracking made simple. Log meals with a photo, 
            track your macros, and get personalized insights to reach your health goals.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">📸</div>
              <h3 className="text-lg font-semibold mb-2">AI Photo Logging</h3>
              <p className="text-gray-600">Snap a photo of your meal and let AI identify foods and estimate nutrition automatically.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Smart Tracking</h3>
              <p className="text-gray-600">Monitor calories, macros, and progress with intuitive dashboards and insights.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Personalized Goals</h3>
              <p className="text-gray-600">Set custom nutrition goals and receive tailored recommendations to achieve them.</p>
            </div>
          </div>

          <div className="space-x-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started Free
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-semibold border border-gray-300 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
