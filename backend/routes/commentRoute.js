import express from "express"
import { addComment, getFoodRatingStats, getBatchRatings, checkCanReview } from "../controllers/commentController.js"
import auth from "../middleware/auth.js"

const commentRouter = express.Router()

// Public routes
commentRouter.get("/food/:foodId/stats", getFoodRatingStats)
commentRouter.post("/get-ratings", getBatchRatings)

// Protected routes (require login)
commentRouter.post("/add", auth, addComment)
commentRouter.get("/can-rate/:userId/:foodId", auth, checkCanReview)

export default commentRouter
