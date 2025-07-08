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
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark")

    // Check if token exists in localStorage
    const token = localStorage.getItem("token")
    const userData = JSON.parse(localStorage.getItem("userData") || "{}")

    if (token && userData.role) {
      setIsAuthenticated(true)
      setUserRole(userData.role)
    }
    setIsLoading(false)
  }, [])

  // Function to handle login
  const handleLogin = (token, user) => {
    localStorage.setItem("token", token)
    localStorage.setItem("userData", JSON.stringify(user))
    setIsAuthenticated(true)
    setUserRole(user.role)
  }

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userData")
    setIsAuthenticated(false)
    setUserRole(null)
  }

  // Role-based route protection
  const ProtectedRoute = ({ children, allowedRoles = ["admin", "staff"] }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/orders" replace />
    }

    return children
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-900 text-white transition-colors duration-300">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
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
                path="/revenue"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Revenue url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Add url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Profile url={url} />
                  </ProtectedRoute>
                }
              />

              {/* Admin and Staff routes */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
                    <Orders url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/list"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
                    <List url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vouchers"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
                    <Vouchers url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/comments"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
                    <Comments url={url} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute allowedRoles={["admin", "staff"]}>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* Default route based on role */}
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
