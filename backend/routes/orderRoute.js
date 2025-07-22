import express from "express"
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  updatePaymentStatus,
  getRevenueStats,
  exportInvoice,
  confirmDelivery,
} from "../controllers/orderController.js"
import { getUserPurchaseHistory } from "../controllers/purchaseHistoryController.js"
import requireSignIn, { authMiddleware, verifyAdmin, verifyStaffOrAdmin } from "../middleware/auth.js"

const orderRouter = express.Router()

// Public/User routes
orderRouter.post("/place", authMiddleware, placeOrder)
orderRouter.post("/verify", verifyOrder)
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.post("/purchase-history", requireSignIn, getUserPurchaseHistory)
orderRouter.post("/confirm-delivery", authMiddleware, confirmDelivery)

// Staff/Admin routes
orderRouter.get("/list", verifyStaffOrAdmin, listOrders)
orderRouter.post("/status", verifyStaffOrAdmin, updateStatus)
orderRouter.post("/payment-status", verifyStaffOrAdmin, updatePaymentStatus)

// Admin only routes
orderRouter.get("/revenue-stats", verifyAdmin, getRevenueStats)
orderRouter.get("/export-invoice/:orderId", verifyStaffOrAdmin, exportInvoice)

export default orderRouter
