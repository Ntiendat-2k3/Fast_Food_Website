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
commentRouter.post("/batch-ratings", getBatchRatings)
commentRouter.get("/check/:userId/:foodId", checkCanReview)

// Admin routes
commentRouter.get("/all", authMiddleware, getAllComments)
commentRouter.post("/status", authMiddleware, toggleApproveComment)
commentRouter.post("/delete", authMiddleware, deleteComment)
commentRouter.post("/reply", authMiddleware, replyToComment)

export default commentRouter
