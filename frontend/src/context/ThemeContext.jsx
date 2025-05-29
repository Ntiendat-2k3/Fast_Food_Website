"use client"

import { createContext, useContext, useEffect, useState } from "react"

export const ThemeContext = createContext()

// Provider component
export const ThemeProvider = ({ children }) => {
  // Mặc định là dark mode để phù hợp với thiết kế mới
  const [darkMode, setDarkMode] = useState(() => {
    // Kiểm tra localStorage trước
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      return savedTheme === "dark"
    }
    // Mặc định là dark mode thay vì light
    return true
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  return <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
