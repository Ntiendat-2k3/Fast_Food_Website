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
    req.body.userId = token_decode.id
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Require sign in middleware
const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization || req.headers.token
    console.log("Auth middleware - token received:", token ? "Yes" : "No")

    if (!token) {
      console.log("No token provided")
      return res.json({ success: false, message: "Authorization token required" })
    }

    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token
    console.log("Decoding token...")

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET)
    console.log("Token decoded successfully, user ID:", decoded.id)

    const user = await userModel.findById(decoded.id).select("-password")
    if (!user) {
      console.log("User not found in database")
      return res.json({ success: false, message: "User not found" })
    }

    console.log("User found:", { id: user._id, name: user.name, role: user.role })

    req.user = user
    req.userId = user._id
    req.userRole = user.role
    next()
  } catch (error) {
    console.error("Auth middleware error:", error.message)
    return res.json({ success: false, message: "Invalid token" })
  }
}

// Admin verification
const isAdmin = (req, res, next) => {
  try {
    console.log("Admin check - user role:", req.user?.role)
    if (req.user && req.user.role === "admin") {
      next()
    } else {
      console.log("Admin access denied")
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
    console.log("Staff/Admin check - user role:", req.user?.role)
    if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
      next()
    } else {
      console.log("Staff/Admin access denied")
      return res.json({ success: false, message: "Staff or Admin access required" })
    }
  } catch (error) {
    console.error("Staff/Admin check error:", error)
    return res.json({ success: false, message: "Authorization error" })
  }
}

// Verify admin only
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization || req.headers.token
    console.log("Admin verification - token received:", token ? "Yes" : "No")

    if (!token) {
      return res.json({ success: false, message: "Authorization token required" })
    }

    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.id).select("-password")
    if (!user || user.role !== "admin") {
      console.log("Admin verification failed - user role:", user?.role)
      return res.json({ success: false, message: "Admin access required" })
    }

    console.log("Admin verification successful")
    req.user = user
    req.userId = user._id
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
    const token = req.headers.authorization || req.headers.token
    console.log("Staff/Admin verification - token received:", token ? "Yes" : "No")

    if (!token) {
      return res.json({ success: false, message: "Authorization token required" })
    }

    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.id).select("-password")
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      console.log("Staff/Admin verification failed - user role:", user?.role)
      return res.json({ success: false, message: "Staff or Admin access required" })
    }

    console.log("Staff/Admin verification successful - role:", user.role)
    req.user = user
    req.userId = user._id
    req.userRole = user.role
    next()
  } catch (error) {
    console.error("Staff/Admin verification error:", error)
    return res.json({ success: false, message: "Invalid token or insufficient permissions" })
  }
}

export { authMiddleware, isAdmin, isStaffOrAdmin, verifyAdmin, verifyStaffOrAdmin }
export default requireSignIn
