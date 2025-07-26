import express from "express"
import {
  addComment,
  getCommentsByFood,
  getFoodRatingStats,
  getBatchRatings,
  checkCanReview,
  getAllComments,
  toggleApproveComment,
  deleteComment,
  replyToComment,
} from "../controllers/commentController.js"
import authMiddleware from "../middleware/auth.js"

const commentRouter = express.Router()

// Public routes
commentRouter.post("/add", addComment)
commentRouter.get("/food/:foodId", getCommentsByFood)
commentRouter.get("/food/:foodId/stats", getFoodRatingStats)
commentRouter.get("/rating-stats/:foodId", getFoodRatingStats) // Add this route
commentRouter.post("/batch-ratings", getBatchRatings)
commentRouter.post("/get-ratings", getBatchRatings) // Add this route for compatibility
commentRouter.get("/check/:userId/:foodId", checkCanReview)
commentRouter.get("/can-rate/:userId/:foodId", checkCanReview) // Add this route

// Admin routes
commentRouter.get("/all", authMiddleware, getAllComments)
commentRouter.post("/status", authMiddleware, toggleApproveComment)
commentRouter.post("/delete", authMiddleware, deleteComment)
commentRouter.post("/reply", authMiddleware, replyToComment)

export default commentRouter
