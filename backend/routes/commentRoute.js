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
  debugUserOrders,
} from "../controllers/commentController.js"
import authMiddleware from "../middleware/auth.js"

const commentRouter = express.Router()

// Public routes
commentRouter.get("/food/:foodId", getCommentsByFood)
commentRouter.get("/food/:foodId/stats", getFoodRatingStats)
commentRouter.post("/batch-ratings", getBatchRatings)

// Protected routes (require authentication)
commentRouter.post("/add-comment", authMiddleware, addComment)
commentRouter.get("/check/:userId/:foodId", authMiddleware, checkCanReview)

// Admin routes
commentRouter.get("/all", authMiddleware, getAllComments)
commentRouter.post("/toggle-approve", authMiddleware, toggleApproveComment)
commentRouter.post("/delete", authMiddleware, deleteComment)
commentRouter.post("/reply", authMiddleware, replyToComment)

// Debug route
commentRouter.get("/debug/user-orders/:userId", authMiddleware, debugUserOrders)

export default commentRouter
