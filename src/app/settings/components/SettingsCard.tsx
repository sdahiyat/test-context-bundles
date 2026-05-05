import React from 'react'

interface SettingsCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function SettingsCard({ title, description, children, className = '' }: SettingsCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4 ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
