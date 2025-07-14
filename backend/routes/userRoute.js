import express from "express"
import {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  blockUser,
  unblockUser,
  getBlacklist,
  deleteUser,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword, // New import
} from "../controllers/userController.js"
import requireSignIn, { verifyAdmin, verifyStaffOrAdmin } from "../middleware/auth.js"

const userRouter = express.Router()

// Public routes
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser) // Now uses 'name' for login
userRouter.post("/admin-login", adminLogin)
userRouter.post("/google-login", googleLogin)
userRouter.post("/verify-email", verifyEmail)
userRouter.post("/forgot-password", forgotPassword) // Sends a code to email
userRouter.post("/reset-password", resetPassword) // Uses code from email to reset password

// Protected routes
userRouter.get("/profile", requireSignIn, getUserProfile)
userRouter.put("/profile", requireSignIn, updateUserProfile)
userRouter.post("/change-password", requireSignIn, changePassword) // New protected route for logged-in users

// Admin/Staff routes
userRouter.get("/list", requireSignIn, verifyStaffOrAdmin, getAllUsers)
userRouter.get("/blacklist", requireSignIn, verifyStaffOrAdmin, getBlacklist)
userRouter.post("/block", requireSignIn, verifyStaffOrAdmin, blockUser)
userRouter.post("/unblock", requireSignIn, verifyStaffOrAdmin, unblockUser)

// Admin only routes
userRouter.post("/delete", requireSignIn, verifyAdmin, deleteUser)

export default userRouter
