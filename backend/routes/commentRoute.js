import express from "express"
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  getCommentsByProduct,
  approveComment,
  rejectComment,
  getAllComments,
} from "../controllers/commentController.js"
import { requireSignIn, verifyAdminOrStaff } from "../middleware/auth.js"

const commentRouter = express.Router()

// Public routes
commentRouter.get("/product/:productId", getCommentsByProduct)

// User routes (require authentication)
commentRouter.post("/add", requireSignIn, addComment)
commentRouter.put("/update/:id", requireSignIn, updateComment)
commentRouter.delete("/delete/:id", requireSignIn, deleteComment)

// Admin/Staff routes
commentRouter.get("/all", verifyAdminOrStaff, getAllComments)
commentRouter.get("/", verifyAdminOrStaff, getComments)
commentRouter.put("/approve/:id", verifyAdminOrStaff, approveComment)
commentRouter.put("/reject/:id", verifyAdminOrStaff, rejectComment)

export default commentRouter
