import express from "express"
import authMiddleware from "../middleware/auth.js"
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  updatePaymentStatus,
} from "../controllers/orderController.js"

const orderRouter = express.Router()

orderRouter.post("/place", authMiddleware, placeOrder)
orderRouter.post("/verify", verifyOrder)
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.get("/list", listOrders)
orderRouter.post("/status", updateStatus)
orderRouter.post("/payment-status", updatePaymentStatus)

export default orderRouter
