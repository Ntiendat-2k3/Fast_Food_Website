import express from "express"
import {
  addRating,
  updateRating,
  getRatingsByFood,
  getAllRatings,
  updateRatingStatus,
  deleteRating,
  getFoodRatingStats,
  checkCanRate,
  debugUserOrders,
} from "../controllers/commentController.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Add a new rating (requires authentication)
router.post("/add", auth, addRating)

// Update a rating (requires authentication)
router.put("/update", auth, updateRating)

// Get ratings by food ID (public)
router.get("/food/:foodId", getRatingsByFood)

// Get food rating stats (public)
router.get("/food/:foodId/stats", getFoodRatingStats)

// Get all ratings (admin only, requires authentication)
router.get("/all", auth, getAllRatings)

// Update rating status (admin only, requires authentication)
router.post("/status", auth, updateRatingStatus)

// Delete a rating (admin only, requires authentication)
router.post("/delete", auth, deleteRating)

// Check if user can rate a product (requires authentication)
router.get("/can-rate/:userId/:foodId", auth, checkCanRate)

// Debug endpoint to see user orders and purchase data
router.get("/debug/:userId/:foodId", auth, debugUserOrders)

export default router
