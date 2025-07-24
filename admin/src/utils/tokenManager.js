// /**
//  * Token Manager Utility
//  * Handles token storage, validation, and refresh
//  */

// // Check if token is expired
// export const isTokenExpired = (token) => {
//     if (!token) return true
  
//     try {
//       // Get the expiration part from the token
//       const base64Url = token.split(".")[1]
//       const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
//       const jsonPayload = decodeURIComponent(
//         atob(base64)
//           .split("")
//           .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//           .join(""),
//       )
  
//       const { exp } = JSON.parse(jsonPayload)
//       const currentTime = Math.floor(Date.now() / 1000)
  
//       return exp < currentTime
//     } catch (error) {
//       console.error("Error checking token expiration:", error)
//       return true // If we can't verify, assume it's expired
//     }
//   }
  
//   // Clear all stored tokens and user data
//   export const clearAllTokens = () => {
//     console.log("Clearing all stored tokens and user data")
//     localStorage.removeItem("token")
//     localStorage.removeItem("user")
//     sessionStorage.removeItem("token")
//     sessionStorage.removeItem("user")
  
//     // Also clear any other related storage
//     try {
//       // Clear any other auth-related items you might have
//       const storageKeys = Object.keys(localStorage)
//       storageKeys.forEach((key) => {
//         if (key.includes("auth") || key.includes("token")) {
//           localStorage.removeItem(key)
//         }
//       })
//     } catch (error) {
//       console.error("Error clearing additional storage:", error)
//     }
  
//     return true
//   }
  
//   // Get stored token
//   export const getStoredToken = () => {
//     const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  
//     // Check if token exists and is not expired
//     if (token && !isTokenExpired(token)) {
//       return token
//     }
  
//     // If token is expired, clear it
//     if (token) {
//       clearAllTokens()
//     }
  
//     return null
//   }
  
//   // Store token with optional "remember me" functionality
//   export const storeToken = (token, user, rememberMe = true) => {
//     if (!token || !user) return false
  
//     const storage = rememberMe ? localStorage : sessionStorage
  
//     storage.setItem("token", token)
//     storage.setItem("user", JSON.stringify(user))
  
//     return true
//   }
  