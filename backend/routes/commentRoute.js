import express from "express"
import {
  addComment,
  updateComment,
  getCommentsByFood,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  replyToComment,
  getFoodRatingStats,
  checkCanReview,
  debugUserOrders,
} from "../controllers/commentController.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Add a new comment (requires authentication)
router.post("/add", auth, addComment)

// Update a comment (requires authentication)
router.put("/update", auth, updateComment)

// Get comments by food ID (public)
router.get("/food/:foodId", getCommentsByFood)

// Get food rating stats (public)
router.get("/food/:foodId/stats", getFoodRatingStats)

// Get all comments (admin only, requires authentication)
router.get("/all", auth, getAllComments)

// Update comment status (admin only, requires authentication)
router.post("/status", auth, updateCommentStatus)

// Delete a comment (admin only, requires authentication)
router.post("/delete", auth, deleteComment)

// Reply to a comment (admin only, requires authentication)
router.post("/reply", auth, replyToComment)

// Check if user can review a product (requires authentication)
router.get("/can-review/:userId/:foodId", auth, checkCanReview)

// Debug endpoint to see user orders and purchase data
router.get("/debug/:userId/:foodId", auth, debugUserOrders)

export default router
