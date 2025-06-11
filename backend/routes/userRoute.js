import express from "express"
import {
  loginUser,
  registerUser,
  getUserProfile,
  adminLogin,
  getAllUsers,
  blockUser,
  unblockUser,
  getBlacklist,
  googleLogin,
} from "../controllers/userController.js"
import auth, { verifyAdmin } from "../middleware/auth.js"

const router = express.Router()

router.post("/login", loginUser)
router.post("/google-login", googleLogin)
router.post("/admin/login", adminLogin)
router.post("/register", registerUser)
router.get("/profile", auth, getUserProfile)
router.get("/list", verifyAdmin, getAllUsers)
router.post("/block", verifyAdmin, blockUser)
router.post("/unblock", verifyAdmin, unblockUser)
router.get("/blacklist", verifyAdmin, getBlacklist)

export default router
