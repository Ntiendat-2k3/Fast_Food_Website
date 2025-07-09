import express from "express"
import {
  addToCart,
  removeFromCart,
  removeFromCartAll,
  getCart,
  clearCart,
  updateCartQuantity,
} from "../controllers/cartController.js"
import { authMiddleware } from "../middleware/auth.js"

const cartRouter = express.Router()

// All cart routes require authentication
cartRouter.post("/add", authMiddleware, addToCart)
cartRouter.post("/remove", authMiddleware, removeFromCart)
cartRouter.post("/remove-all", authMiddleware, removeFromCartAll)
cartRouter.post("/get", authMiddleware, getCart)
cartRouter.post("/clear", authMiddleware, clearCart)
cartRouter.post("/update-quantity", authMiddleware, updateCartQuantity)

export default cartRouter
