import express from "express"
import authMiddleware, { requireSignIn, verifyAdmin } from "../middleware/auth.js"
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  updatePaymentStatus,
  getPurchaseHistory,
} from "../controllers/orderController.js"

const orderRouter = express.Router()

orderRouter.post("/place", authMiddleware, placeOrder)
orderRouter.post("/verify", verifyOrder)
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.get("/list", verifyAdmin, listOrders)
orderRouter.post("/status", verifyAdmin, updateStatus)
orderRouter.post("/payment-status", verifyAdmin, updatePaymentStatus)
orderRouter.get("/purchase-history", requireSignIn, getPurchaseHistory)

export default orderRouter
