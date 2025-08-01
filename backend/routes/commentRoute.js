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

console.log("Comment router initialized")

// Public routes - không cần authentication
commentRouter.get(
  "/food/:foodId",
  (req, res, next) => {
    console.log("Route hit: GET /food/:foodId")
    console.log("Params:", req.params)
    next()
  },
  getCommentsByFood,
)

commentRouter.get(
  "/food/:foodId/stats",
  (req, res, next) => {
    console.log("Route hit: GET /food/:foodId/stats")
    console.log("Params:", req.params)
    next()
  },
  getFoodRatingStats,
)

commentRouter.post("/batch-ratings", getBatchRatings)

// Protected routes - cần authentication
commentRouter.post("/add", authMiddleware, addComment)
commentRouter.get("/check/:userId/:foodId", authMiddleware, checkCanReview)
commentRouter.get("/debug/:userId", authMiddleware, debugUserOrders)

// Admin routes - cần authentication
commentRouter.get("/all", authMiddleware, getAllComments)
commentRouter.post("/toggle-approve", authMiddleware, toggleApproveComment)
commentRouter.post("/delete", authMiddleware, deleteComment)
commentRouter.post("/reply", authMiddleware, replyToComment)

export default commentRouter
