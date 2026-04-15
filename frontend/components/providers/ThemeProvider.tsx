'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start as 'dark' to match the default CSS
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('mc-theme') as Theme | null
    if (stored === 'light') {
      setTheme('light')
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      // Default to dark — CSS already handles this via :root vars
      setTheme('dark')
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
      localStorage.setItem('mc-theme', 'light')
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      setTheme('dark')
      localStorage.setItem('mc-theme', 'dark')
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
