import express from "express"
import { chatWithAI } from "../controllers/aiController.js"

const router = express.Router()

// Route cho AI chat
router.post("/chat", chatWithAI)

export default router
