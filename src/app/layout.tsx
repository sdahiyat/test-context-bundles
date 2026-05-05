import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NutriTrack – AI-Powered Nutrition Tracking',
  description:
    'Track your nutrition effortlessly with AI-powered meal logging and personalized insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Desktop Top Navigation */}
        <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-14 items-center z-50 px-6">
          <div className="flex items-center gap-1 max-w-5xl mx-auto w-full">
            <Link
              href="/"
              className="text-lg font-bold text-emerald-600 mr-6 flex items-center gap-1"
            >
              <span>🥗</span> NutriTrack
            </Link>
            <div className="flex gap-1 flex-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span>📊</span> Dashboard
              </Link>
              <Link
                href="/log"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span>➕</span> Log Meal
              </Link>
              <Link
                href="/insights"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span>✨</span> Insights
              </Link>
              <Link
                href="/progress"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span>📈</span> Progress
              </Link>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span>👤</span> Profile
            </Link>
          </div>
        </nav>

        {/* Main content with top padding for desktop nav */}
        <main className="md:pt-14 pb-16 md:pb-0 min-h-screen">{children}</main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 md:hidden">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-emerald-600 transition-colors min-w-0"
          >
            <span className="text-xl">📊</span>
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link
            href="/log"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-emerald-600 transition-colors min-w-0"
          >
            <span className="text-xl">➕</span>
            <span className="text-xs font-medium">Log Meal</span>
          </Link>
          <Link
            href="/insights"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-emerald-600 transition-colors min-w-0"
          >
            <span className="text-xl">✨</span>
            <span className="text-xs font-medium">Insights</span>
          </Link>
          <Link
            href="/progress"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-emerald-600 transition-colors min-w-0"
          >
            <span className="text-xl">📈</span>
            <span className="text-xs font-medium">Progress</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-emerald-600 transition-colors min-w-0"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </nav>
      </body>
    </html>
  );
}
