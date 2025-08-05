import express from "express"
import {
  addComment,
  getCommentsByFood,
  getFoodRatingStats,
  checkCanReview,
  getAllComments,
  deleteComment,
} from "../controllers/commentController.js"
import authMiddleware from "../middleware/auth.js"

const commentRouter = express.Router()

// Public routes
commentRouter.get("/food/:foodId", getCommentsByFood)
commentRouter.get("/food/:foodId/stats", getFoodRatingStats)

// Protected routes
commentRouter.post("/add", authMiddleware, addComment)
commentRouter.get("/check/:userId/:foodId", authMiddleware, checkCanReview)

// Admin routes
commentRouter.get("/all", authMiddleware, getAllComments)
commentRouter.post("/delete", authMiddleware, deleteComment)

export default commentRouter
