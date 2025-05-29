"use client"

import { createContext, useContext, useEffect, useState } from "react"

export const ThemeContext = createContext()

// Provider component
export const ThemeProvider = ({ children }) => {
  // Kiểm tra theme từ localStorage hoặc preference của người dùng
  const [darkMode, setDarkMode] = useState(() => {
    // Kiểm tra localStorage trước
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      return savedTheme === "dark"
    }
    // Nếu không có, kiểm tra preference của hệ thống
    return window.matchMedia("(prefers-color-scheme: dark)").matches
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
