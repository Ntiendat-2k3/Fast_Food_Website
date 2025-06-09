import express from "express"
import {
  getPurchaseHistory,
  getPurchaseStatistics,
  addPurchaseReview,
} from "../controllers/purchaseHistoryController.js"
import { requireSignIn } from "../middleware/auth.js"

const purchaseHistoryRouter = express.Router()

// Get purchase history with filters
purchaseHistoryRouter.get("/list", requireSignIn, getPurchaseHistory)

// Get purchase statistics
purchaseHistoryRouter.get("/statistics", requireSignIn, getPurchaseStatistics)

// Add review to purchase
purchaseHistoryRouter.post("/review", requireSignIn, addPurchaseReview)

export default purchaseHistoryRouter
