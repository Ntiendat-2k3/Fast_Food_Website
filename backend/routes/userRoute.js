import express from "express"
import {
  loginUser,
  registerUser,
  adminLogin,
  getAllUsers,
  blockUser,
  unblockUser,
  getBlacklist,
  updateUserRole,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserStats,
  changePassword,
} from "../controllers/userController.js"
import { requireSignIn, verifyAdmin, verifyAdminOrStaff } from "../middleware/auth.js"

const userRouter = express.Router()

// Public routes
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/admin", adminLogin)

// User routes (require authentication)
userRouter.get("/profile", requireSignIn, getUserProfile)
userRouter.put("/profile", requireSignIn, updateUserProfile)
userRouter.post("/change-password", requireSignIn, changePassword)

// Admin/Staff routes - Staff can now manage users
userRouter.get("/all", verifyAdminOrStaff, getAllUsers)
userRouter.get("/stats", verifyAdminOrStaff, getUserStats)
userRouter.get("/blacklist", verifyAdminOrStaff, getBlacklist)
userRouter.post("/block", verifyAdminOrStaff, blockUser)
userRouter.post("/unblock", verifyAdminOrStaff, unblockUser)

// Admin only routes - These remain admin-only for security
userRouter.put("/role", verifyAdmin, updateUserRole)
userRouter.delete("/delete/:id", verifyAdmin, deleteUser)

export default userRouter
