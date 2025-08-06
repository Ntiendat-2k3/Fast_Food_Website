import express from "express"
import {
  addComment,
  getCommentsByFood,
  getFoodRatingStats,
  checkCanReview,
  getAllComments,
  deleteComment,
  replyComment,
  deleteReply,
  updateReply,
  updateComment,
} from "../controllers/commentController.js"
import authMiddleware from "../middleware/auth.js"

const commentRouter = express.Router()

// Public routes
commentRouter.get("/food/:foodId", getCommentsByFood)
commentRouter.get("/food/:foodId/stats", getFoodRatingStats)

// Protected routes
commentRouter.post("/add", authMiddleware, addComment)
commentRouter.get("/check/:userId/:foodId", authMiddleware, checkCanReview)
commentRouter.put("/update", authMiddleware, updateComment) // Added update comment route for users

// Admin routes
commentRouter.get("/all", authMiddleware, getAllComments)
commentRouter.post("/delete", authMiddleware, deleteComment)
commentRouter.post("/reply", authMiddleware, replyComment)
commentRouter.put("/admin/:commentId/reply", authMiddleware, updateReply);
commentRouter.post("/delete-reply", authMiddleware, deleteReply)

export default commentRouter
