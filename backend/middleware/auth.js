import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import blacklistModel from "../models/blacklistModel.js"
import dotenv from "dotenv"

dotenv.config()

// Middleware to check if user is authenticated
const authMiddleware = async (req, res, next) => {
  const { token } = req.headers

  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" })
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(token_decode.id)

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    // Check if user is blocked
    const isBlocked = await blacklistModel.findOne({ userId: user._id })
    if (isBlocked) {
      console.log("User is blocked:", user.name)
      return res.json({ success: false, message: "Your account has been blocked" })
    }

    req.body.userId = token_decode.id
    req.user = user
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Middleware to check if user is authenticated (alias for backward compatibility)
export const requireSignIn = authMiddleware

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  try {
    // Check if user exists in request (should be set by requireSignIn middleware)
    if (!req.user) {
      return res.json({
        success: false,
        message: "Authentication failed: User not found",
      })
    }

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.json({
        success: false,
        message: "Authorization failed: Admin access required",
      })
    }

    // User is admin, proceed to next middleware
    next()
  } catch (error) {
    console.error("Admin check middleware error:", error)
    return res.json({
      success: false,
      message: "Authorization failed: Server error",
    })
  }
}

// Middleware to check if user is admin or staff
export const isAdminOrStaff = async (req, res, next) => {
  try {
    // Check if user exists in request (should be set by requireSignIn middleware)
    if (!req.user) {
      return res.json({
        success: false,
        message: "Authentication failed: User not found",
      })
    }

    // Check if user is admin or staff
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.json({
        success: false,
        message: "Authorization failed: Admin or Staff access required",
      })
    }

    // User is admin or staff, proceed to next middleware
    console.log("Authorization successful for user:", req.user.name, "with role:", req.user.role)
    next()
  } catch (error) {
    console.error("Admin/Staff check middleware error:", error)
    return res.json({
      success: false,
      message: "Authorization failed: Server error",
    })
  }
}

// Middleware to verify admin (combines authentication and admin check)
export const verifyAdmin = async (req, res, next) => {
  const { token } = req.headers

  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" })
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(token_decode.id)

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    // Check if user is admin
    if (user.role !== "admin") {
      console.log("Access denied - user is not admin:", user.name)
      return res.json({
        success: false,
        message: "Authorization failed: Admin access required",
      })
    }

    req.body.userId = token_decode.id
    req.user = user
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Middleware to verify admin or staff (combines authentication and admin/staff check)
export const verifyAdminOrStaff = async (req, res, next) => {
  const { token } = req.headers

  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" })
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(token_decode.id)

    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    // Check if user is admin or staff
    if (user.role !== "admin" && user.role !== "staff") {
      console.log("Access denied - user is not admin or staff:", user.name, "role:", user.role)
      return res.json({
        success: false,
        message: "Authorization failed: Admin or Staff access required",
      })
    }

    req.body.userId = token_decode.id
    req.user = user
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// For backward compatibility - default export
export default authMiddleware
