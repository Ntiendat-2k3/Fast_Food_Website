import express from "express"
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  updatePaymentStatus,
  getUserPurchaseHistory,
  getRevenueStats,
  getRevenueBreakdown,
  exportInvoice,
  confirmDelivery,
  autoCompleteOrders,
  cancelOrder,
} from "../controllers/orderController.js"
import { authMiddleware, verifyAdmin, verifyStaffOrAdmin } from "../middleware/auth.js"

const orderRouter = express.Router()

// User routes
orderRouter.post("/place", authMiddleware, placeOrder)
orderRouter.post("/verify", verifyOrder)
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.post("/confirm-delivery", authMiddleware, confirmDelivery)
orderRouter.post("/cancel", authMiddleware, cancelOrder)
orderRouter.post("/purchase-history", authMiddleware, getUserPurchaseHistory)

// Admin routes
orderRouter.get("/list", verifyStaffOrAdmin, listOrders)
orderRouter.post("/status", verifyStaffOrAdmin, updateStatus)
orderRouter.post("/payment-status", verifyStaffOrAdmin, updatePaymentStatus)
orderRouter.get("/revenue-stats", verifyStaffOrAdmin, getRevenueStats)
orderRouter.get("/revenue-breakdown", verifyStaffOrAdmin, getRevenueBreakdown)
orderRouter.get("/export-invoice/:orderId", verifyStaffOrAdmin, exportInvoice)

export default orderRouter
