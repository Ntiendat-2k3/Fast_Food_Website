"use client"

import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Add from "./pages/Add/Add"
import List from "./pages/List/List"
import Orders from "./pages/Orders/Orders"
import Profile from "./pages/Profile/Profile"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Revenue from "./pages/Revenue/Revenue"
import Vouchers from "./pages/Vouchers/Vouchers"
import Comments from "./pages/Comments/Comments"
import { ThemeProvider } from "./context/ThemeContext"
import Login from "./pages/Login/Login"
import { useState, useEffect } from "react"
import Chat from "./pages/Chat/Chat"

const App = () => {
  const url = "http://localhost:4000"
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  // Function to handle login
  const handleLogin = (token) => {
    localStorage.setItem("token", token)
    setIsAuthenticated(true)
  }

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
  }

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redirect to login with the return url
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return children
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white transition-colors duration-300">
        <ToastContainer />
        {isAuthenticated && <Sidebar onLogout={handleLogout} />}
        <main className={isAuthenticated ? "md:ml-64 pt-16 md:pt-0 transition-all duration-300" : ""}>
          <div className={isAuthenticated ? "px-0 py-0 md:px-4 md:py-6" : "container mx-auto px-4 py-6"}>
            <Routes>
              <Route
                path="/login"
                element={<Login url={url} onLogin={handleLogin} isAuthenticated={isAuthenticated} />}
              />
              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <Add url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/list"
                element={
                  <ProtectedRoute>
                    <List url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revenue"
                element={
                  <ProtectedRoute>
                    <Revenue url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers"
                element={
                  <ProtectedRoute>
                    <Vouchers url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comments"
                element={
                  <ProtectedRoute>
                    <Comments url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              {/* Default route - redirect to revenue */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/revenue" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={isAuthenticated ? <Navigate to="/revenue" replace /> : <Navigate to="/login" replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
