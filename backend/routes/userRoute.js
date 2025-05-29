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
} from "../controllers/userController.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.post("/login", loginUser)
router.post("/admin/login", adminLogin)
router.post("/register", registerUser)
router.get("/profile", auth, getUserProfile)
router.get("/list", auth, getAllUsers)
router.post("/block", auth, blockUser)
router.post("/unblock", auth, unblockUser)
router.get("/blacklist", auth, getBlacklist)

export default router
