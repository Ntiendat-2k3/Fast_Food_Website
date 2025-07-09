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
} from "../controllers/userController.js"
import requireSignIn, { verifyAdmin, verifyStaffOrAdmin } from "../middleware/auth.js"

const userRouter = express.Router()

// Public routes
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/admin-login", adminLogin)
userRouter.post("/google-login", googleLogin)

// Protected routes
userRouter.get("/profile", requireSignIn, getUserProfile)
userRouter.put("/profile", requireSignIn, updateUserProfile)

// Admin/Staff routes
userRouter.get("/list", requireSignIn, verifyStaffOrAdmin, getAllUsers)
userRouter.get("/blacklist", requireSignIn, verifyStaffOrAdmin, getBlacklist)
userRouter.post("/block", requireSignIn, verifyStaffOrAdmin, blockUser)
userRouter.post("/unblock", requireSignIn, verifyStaffOrAdmin, unblockUser)

// Admin only routes
userRouter.post("/delete", requireSignIn, verifyAdmin, deleteUser)

export default userRouter
