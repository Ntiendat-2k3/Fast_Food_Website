import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

// Basic auth middleware
const authMiddleware = async (req, res, next) => {
  const { token } = req.headers
  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" })
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    // Set userId in both req.body and req.userId for compatibility
    req.body.userId = token_decode.id
    req.userId = token_decode.id
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Require sign in middleware
const requireSignIn = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.token
    // console.log("Auth middleware - token received:", token ? "Yes" : "No")

    if (!token) {
      // console.log("No token provided")
      return res.json({ success: false, message: "Authorization token required" })
    }

    // Handle Bearer token format
    if (token.startsWith("Bearer ")) {
      token = token.slice(7)
    }

    // console.log("Decoding token...")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // console.log("Token decoded successfully, user ID:", decoded.id, "role:", decoded.role)

    const user = await userModel.findById(decoded.id).select("-password")
    if (!user) {
      // console.log("User not found in database")
      return res.json({ success: false, message: "User not found" })
    }

    // console.log("User found:", { id: user._id, name: user.name, role: user.role })

    // Set both req.user and req.userId for compatibility
    req.user = user
    req.userId = user._id.toString() // Ensure it's a string
    req.userRole = user.role

    // console.log("Auth middleware completed - userId set to:", req.userId)
    next()
  } catch (error) {
    console.error("Auth middleware error:", error.message)
    return res.json({ success: false, message: "Invalid token" })
  }
}

// Admin verification
const isAdmin = (req, res, next) => {
  try {
    // console.log("Admin check - user role:", req.user?.role)
    if (req.user && req.user.role === "admin") {
      // console.log("Admin access granted")
      next()
    } else {
      // console.log("Admin access denied - user role:", req.user?.role)
      return res.json({ success: false, message: "Admin access required" })
    }
  } catch (error) {
    console.error("Admin check error:", error)
    return res.json({ success: false, message: "Authorization error" })
  }
}

// Staff or Admin verification
const isStaffOrAdmin = (req, res, next) => {
  try {
    // console.log("Staff/Admin check - user role:", req.user?.role)
    if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
      // console.log("Staff/Admin access granted")
      next()
    } else {
      // console.log("Staff/Admin access denied - user role:", req.user?.role)
      return res.json({ success: false, message: "Access denied. Admin or staff role required." })
    }
  } catch (error) {
    console.error("Staff/Admin check error:", error)
    return res.json({ success: false, message: "Authorization error" })
  }
}

// Verify admin only
const verifyAdmin = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.token
    // console.log("Admin verification - token received:", token ? "Yes" : "No")

    if (!token) {
      return res.json({ success: false, message: "Authorization token required" })
    }

    // Handle Bearer token format
    if (token.startsWith("Bearer ")) {
      token = token.slice(7)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // console.log("Admin verification - decoded role:", decoded.role)

    const user = await userModel.findById(decoded.id).select("-password")
    if (!user || user.role !== "admin") {
      // console.log("Admin verification failed - user role:", user?.role)
      return res.json({ success: false, message: "Admin access required" })
    }

    // console.log("Admin verification successful")
    req.user = user
    req.userId = user._id.toString() // Ensure it's a string
    req.userRole = user.role
    next()
  } catch (error) {
    console.error("Admin verification error:", error)
    return res.json({ success: false, message: "Invalid token or insufficient permissions" })
  }
}

// Verify staff or admin
const verifyStaffOrAdmin = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.token
    // console.log("Staff/Admin verification - token received:", token ? "Yes" : "No")

    if (!token) {
      return res.json({ success: false, message: "Authorization token required" })
    }

    // Handle Bearer token format
    if (token.startsWith("Bearer ")) {
      token = token.slice(7)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // console.log("Staff/Admin verification - decoded role:", decoded.role)

    const user = await userModel.findById(decoded.id).select("-password")
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      // console.log("Staff/Admin verification failed - user role:", user?.role)
      return res.json({ success: false, message: "Access denied. Admin or staff role required." })
    }

    // console.log("Staff/Admin verification successful")
    req.user = user
    req.userId = user._id.toString() // Ensure it's a string
    req.userRole = user.role
    next()
  } catch (error) {
    console.error("Staff/Admin verification error:", error)
    return res.json({ success: false, message: "Invalid token or insufficient permissions" })
  }
}

export { authMiddleware, isAdmin, isStaffOrAdmin, verifyAdmin, verifyStaffOrAdmin }
export default requireSignIn
