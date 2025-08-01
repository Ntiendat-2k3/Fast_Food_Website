import express from "express"
import { chatWithAI } from "../controllers/aiController.js"
import authMiddleware from "../middleware/auth.js"

const router = express.Router()

// Route cho AI chat - có thể không cần auth để khách vãng lai cũng dùng được
router.post("/chat", chatWithAI)

// Route cho AI chat với auth (để lấy thông tin user cụ thể)
router.post("/chat-auth", authMiddleware, (req, res) => {
  // Thêm userId vào request body
  req.body.userId = req.userId
  chatWithAI(req, res)
})

export default router
