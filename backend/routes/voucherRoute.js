import express from "express"
import {
  addVoucher,
  listVouchers,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getActiveVouchers,
} from "../controllers/voucherController.js"
import { verifyAdmin } from "../middleware/auth.js"

const router = express.Router()

// Admin routes
router.post("/add", verifyAdmin, addVoucher)
router.get("/list", verifyAdmin, listVouchers)
router.post("/update", verifyAdmin, updateVoucher)
router.post("/delete", verifyAdmin, deleteVoucher)

// Public routes
router.post("/apply", applyVoucher)
router.get("/active", getActiveVouchers)

export default router
