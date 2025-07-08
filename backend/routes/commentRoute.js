import express from "express"
import {
  getAllComments,
  getCommentsByFood,
  addComment,
  updateCommentStatus,
  replyToComment,
  deleteComment,
  getCommentStats,
} from "../controllers/commentController.js"
import { requireSignIn, verifyAdminOrStaff } from "../middleware/auth.js"

const commentRouter = express.Router()

// Public routes
commentRouter.get("/food/:foodId", getCommentsByFood)

// User routes (require authentication)
commentRouter.post("/add", requireSignIn, addComment)

// Admin/Staff routes - Staff can now manage comments
commentRouter.get("/all", verifyAdminOrStaff, getAllComments)
commentRouter.get("/stats", verifyAdminOrStaff, getCommentStats)
commentRouter.put("/status/:id", verifyAdminOrStaff, updateCommentStatus)
commentRouter.post("/reply/:id", verifyAdminOrStaff, replyToComment)
commentRouter.delete("/delete/:id", verifyAdminOrStaff, deleteComment)

export default commentRouter
