// Utility functions for authentication

// Get the current user from localStorage or context
export const getCurrentUser = () => {
  try {
    const userString = localStorage.getItem("user")
    if (userString) {
      return JSON.parse(userString)
    }
    return null
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

// Check if the user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem("token")
}

// Store user data in localStorage
export const storeUserData = (userData) => {
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData))
  }
}

// Clear user data from localStorage
export const clearUserData = () => {
  localStorage.removeItem("user")
  localStorage.removeItem("token")
}
