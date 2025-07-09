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
import axios from "axios"

const App = () => {
  const url = "http://localhost:4000"
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(null)
  const location = useLocation()

  // Function to get user data from storage
  const getUserFromStorage = () => {
    try {
      // Check localStorage first, then sessionStorage
      const userData = localStorage.getItem("user") || sessionStorage.getItem("user")
      const tokenData = localStorage.getItem("token") || sessionStorage.getItem("token")

      if (tokenData && userData) {
        const user = JSON.parse(userData)
        console.log("User data from storage:", user)
        return { user, token: tokenData }
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      // Clear corrupted data
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("user")
    }
    return null
  }

  // Set up axios interceptor to include token in all requests
  useEffect(() => {
    const setupAxiosInterceptor = () => {
      // Request interceptor to add token to headers
      axios.interceptors.request.use(
        (config) => {
          const currentToken = token || localStorage.getItem("token") || sessionStorage.getItem("token")
          if (currentToken) {
            config.headers.authorization = `Bearer ${currentToken}`
            config.headers.token = currentToken
          }
          return config
        },
        (error) => {
          return Promise.reject(error)
        },
      )

      // Response interceptor to handle auth errors
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            console.log("Token expired or invalid, logging out")
            handleLogout()
          }
          return Promise.reject(error)
        },
      )
    }

    setupAxiosInterceptor()
  }, [token])

  useEffect(() => {
    console.log("App useEffect - checking authentication")
    const storageData = getUserFromStorage()

    if (storageData) {
      const { user, token: storedToken } = storageData
      // Check if user has admin or staff role
      if (user.role === "admin" || user.role === "staff") {
        console.log("Setting authenticated user:", user.name, "Role:", user.role)
        setIsAuthenticated(true)
        setUserRole(user.role)
        setToken(storedToken)
      } else {
        console.log("User does not have admin/staff role:", user.role)
        // Clear invalid user data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("user")
      }
    } else {
      console.log("No valid user data found in storage")
    }
    setIsLoading(false)
  }, [])

  // Function to handle login
  const handleLogin = (tokenData, user) => {
    console.log("handleLogin called with:", { token: tokenData?.substring(0, 10) + "...", user })

    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      console.error("Invalid user role:", user?.role)
      return
    }

    // Store in localStorage by default (can be changed based on remember me)
    localStorage.setItem("token", tokenData)
    localStorage.setItem("user", JSON.stringify(user))

    setIsAuthenticated(true)
    setUserRole(user.role)
    setToken(tokenData)

    console.log("Login successful, user role set to:", user.role)
  }

  // Function to handle logout
  const handleLogout = () => {
    console.log("Logging out user")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")
    setIsAuthenticated(false)
    setUserRole(null)
    setToken(null)
  }

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login")
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check admin-only routes
    if (adminOnly && userRole !== "admin") {
      console.log("Admin-only route accessed by non-admin, redirecting to orders")
      return <Navigate to="/orders" replace />
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

  console.log("App render - isAuthenticated:", isAuthenticated, "userRole:", userRole)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white transition-colors duration-300">
        <ToastContainer />
        {isAuthenticated && <Sidebar onLogout={handleLogout} userRole={userRole} />}
        <main className={isAuthenticated ? "md:ml-64 pt-16 md:pt-0 transition-all duration-300" : ""}>
          <div className={isAuthenticated ? "px-0 py-0 md:px-4 md:py-6" : "container mx-auto px-4 py-6"}>
            <Routes>
              <Route
                path="/login"
                element={<Login url={url} onLogin={handleLogin} isAuthenticated={isAuthenticated} />}
              />

              {/* Admin only routes */}
              <Route
                path="/add"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Add url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revenue"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Revenue url={url} />
                  </ProtectedRoute>
                }
              />

              {/* Staff and Admin routes */}
              <Route
                path="/list"
                element={
                  <ProtectedRoute>
                    <List url={url} userRole={userRole} />
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
                path="/vouchers"
                element={
                  <ProtectedRoute>
                    <Vouchers url={url} userRole={userRole} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comments"
                element={
                  <ProtectedRoute>
                    <Comments url={url} userRole={userRole} />
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

              {/* Default route - redirect based on role */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to={userRole === "admin" ? "/revenue" : "/orders"} replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to={userRole === "admin" ? "/revenue" : "/orders"} replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
