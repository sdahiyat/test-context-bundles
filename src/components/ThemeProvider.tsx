'use client'

import { useEffect } from 'react'
import { applyTheme, getStoredTheme } from '@/lib/theme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Apply stored theme on mount
    const theme = getStoredTheme() ?? 'system'
    applyTheme(theme)

    // Listen for system theme changes when theme is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = () => {
      const currentTheme = getStoredTheme() ?? 'system'
      if (currentTheme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  return <>{children}</>
}
