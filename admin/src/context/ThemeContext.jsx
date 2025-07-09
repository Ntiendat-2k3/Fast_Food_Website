"use client"

import { createContext, useContext, useEffect, useState } from "react"

export const ThemeContext = createContext()

// Provider component
export const ThemeProvider = ({ children }) => {
  // Always use dark mode with golden theme
  const [theme, setTheme] = useState("dark")
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    // Always apply dark mode
    document.documentElement.classList.add("dark")
    document.body.classList.add("dark")
    localStorage.setItem("theme", "dark")

    // Add golden theme class to body
    document.body.classList.add("golden-theme")
  }, [])

  const toggleTheme = () => {
    // For now, we'll keep it always dark with golden theme
    // This can be extended later if needed
    console.log("Golden dark theme is active")
  }

  const toggleDarkMode = () => {
    // Keep dark mode always on for golden theme
    setDarkMode(true)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
        darkMode: true,
        toggleTheme,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
