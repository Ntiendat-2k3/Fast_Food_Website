import express from "express"
import {
  createFeedback,
  getAllFeedback,
  getUserFeedback,
  replyToFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Create a new feedback
router.post("/create", auth, createFeedback)

// Get all feedback (admin only)
router.get("/all", auth, getAllFeedback)

// Get feedback for the current user
router.get("/user", auth, getUserFeedback)

// Reply to feedback (admin only)
router.post("/reply", auth, replyToFeedback)

// Delete feedback (admin only)
router.post("/delete", auth, deleteFeedback)

export default router
