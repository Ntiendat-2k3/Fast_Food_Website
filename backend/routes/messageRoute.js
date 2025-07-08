import express from "express"
import {
  sendMessage,
  getUserMessages,
  getAllMessages,
  getUserConversation,
  markAsRead,
  deleteMessage,
} from "../controllers/messageController.js"
import { requireSignIn, verifyAdminOrStaff } from "../middleware/auth.js"

const messageRouter = express.Router()

// User routes (require authentication)
messageRouter.post("/send", requireSignIn, sendMessage)
messageRouter.get("/user", requireSignIn, getUserMessages)
messageRouter.get("/conversation/:userId", requireSignIn, getUserConversation)
messageRouter.put("/read/:id", requireSignIn, markAsRead)
messageRouter.delete("/delete/:id", requireSignIn, deleteMessage)

// Admin/Staff routes
messageRouter.get("/all", verifyAdminOrStaff, getAllMessages)

export default messageRouter
