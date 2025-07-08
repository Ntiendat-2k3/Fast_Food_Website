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

// Admin/Staff routes
userRouter.get("/all", verifyAdminOrStaff, getAllUsers)
userRouter.get("/blacklist", verifyAdminOrStaff, getBlacklist)
userRouter.post("/block", verifyAdminOrStaff, blockUser)
userRouter.post("/unblock", verifyAdminOrStaff, unblockUser)
userRouter.put("/role", verifyAdmin, updateUserRole)
userRouter.delete("/delete/:id", verifyAdmin, deleteUser)

export default userRouter
