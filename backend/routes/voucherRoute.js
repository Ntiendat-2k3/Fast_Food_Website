import express from "express"
import {
  addVoucher,
  listVouchers,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getActiveVouchers,
} from "../controllers/voucherController.js"
import { verifyStaffOrAdmin } from "../middleware/auth.js"

const router = express.Router()

// Staff and Admin routes - allow both staff and admin to manage vouchers
router.post("/add", verifyStaffOrAdmin, addVoucher)
router.get("/list", verifyStaffOrAdmin, listVouchers)
router.post("/update", verifyStaffOrAdmin, updateVoucher)
router.post("/delete", verifyStaffOrAdmin, deleteVoucher)

// Public routes
router.post("/apply", applyVoucher)
router.get("/active", getActiveVouchers)

export default router
