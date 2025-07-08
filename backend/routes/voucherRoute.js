import express from "express"
import {
  addVoucher,
  listVouchers,
  getActiveVouchers,
  updateVoucher,
  removeVoucher,
  applyVoucher,
  getVoucherStats,
} from "../controllers/voucherController.js"
import { requireSignIn, verifyAdminOrStaff } from "../middleware/auth.js"

const voucherRouter = express.Router()

// Public routes
voucherRouter.get("/active", getActiveVouchers)
voucherRouter.post("/apply", requireSignIn, applyVoucher)

// Admin/Staff routes - Staff can now manage vouchers
voucherRouter.post("/add", verifyAdminOrStaff, addVoucher)
voucherRouter.get("/list", verifyAdminOrStaff, listVouchers)
voucherRouter.get("/stats", verifyAdminOrStaff, getVoucherStats)
voucherRouter.put("/update/:id", verifyAdminOrStaff, updateVoucher)
voucherRouter.delete("/remove/:id", verifyAdminOrStaff, removeVoucher)

export default voucherRouter
