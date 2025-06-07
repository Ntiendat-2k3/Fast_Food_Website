import express from "express"
import {
  addVoucher,
  listVouchers,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getActiveVouchers,
} from "../controllers/voucherController.js"
import { verifyToken, verifyAdmin } from "../middleware/auth.js"

const router = express.Router()

// Admin routes
router.post("/add", verifyToken, verifyAdmin, addVoucher)
router.get("/list", verifyToken, verifyAdmin, listVouchers)
router.post("/update", verifyToken, verifyAdmin, updateVoucher)
router.post("/delete", verifyToken, verifyAdmin, deleteVoucher)

// Public routes
router.post("/apply", applyVoucher)
router.get("/active", getActiveVouchers)

export default router
