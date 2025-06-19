import express from "express"
import requireSignIn from "../middleware/auth.js"
import authMiddleware from "../middleware/auth.js"
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  updatePaymentStatus,
  getRevenueStats,
} from "../controllers/orderController.js"
import { getUserPurchaseHistory } from "../controllers/purchaseHistoryController.js"

const orderRouter = express.Router()

orderRouter.post("/place", authMiddleware, placeOrder)
orderRouter.post("/verify", verifyOrder)
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.get("/list", listOrders)
orderRouter.post("/status", updateStatus)
orderRouter.post("/payment-status", updatePaymentStatus)
orderRouter.post("/purchase-history", requireSignIn, getUserPurchaseHistory)
orderRouter.get("/revenue-stats", getRevenueStats)

export default orderRouter
