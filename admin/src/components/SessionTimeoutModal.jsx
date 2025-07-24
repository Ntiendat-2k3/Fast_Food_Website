"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { toast } from "react-toastify" // Import toast from react-toastify

const SessionTimeoutModal = ({
  isAuthenticated,
  onLogout,
  warningTime = 5 * 60 * 1000, // 5 minutes before expiry
  onRefreshToken,
  url,
}) => {
  const [showModal, setShowModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Function to check token expiration and show warning
  const checkTokenExpiration = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) return

      // Decode token to get expiration time
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )

      const { exp } = JSON.parse(jsonPayload)
      const currentTime = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = (exp - currentTime) * 1000 // Convert to milliseconds

      // If token will expire soon, show warning
      if (timeUntilExpiry > 0 && timeUntilExpiry <= warningTime) {
        setTimeLeft(Math.floor(timeUntilExpiry / 1000))
        setShowModal(true)

        // Start countdown
        const interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(interval)
      }

      // If token already expired, logout
      if (timeUntilExpiry <= 0) {
        onLogout()
      }
    } catch (error) {
      console.error("Error checking token expiration:", error)
    }
  }, [isAuthenticated, warningTime, onLogout])

  // Check token expiration periodically
  useEffect(() => {
    if (!isAuthenticated) return

    checkTokenExpiration()
    const interval = setInterval(checkTokenExpiration, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [isAuthenticated, checkTokenExpiration])

  // Handle refresh token
  const handleRefreshToken = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) {
        onLogout()
        return
      }

      const response = await axios.post(`${url}/api/users/refresh-token`, { token })

      if (response.data.success) {
        // Update token in storage
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage
        storage.setItem("token", response.data.token)

        // Call the onRefreshToken callback if provided
        if (onRefreshToken) {
          onRefreshToken(response.data.token)
        }

        setShowModal(false)
        toast.success("Session extended successfully") // Use toast here
      } else {
        // If refresh failed, logout
        onLogout()
        toast.error("Failed to extend session. Please log in again.") // Use toast here
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
      onLogout()
      toast.error("Session expired. Please log in again.") // Use toast here
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    setShowModal(false)
    onLogout()
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your session is about to expire</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You will be logged out in <span className="font-bold">{timeLeft}</span> seconds due to inactivity.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Logout
          </button>
          <button
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isRefreshing ? "Extending..." : "Stay Logged In"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionTimeoutModal
