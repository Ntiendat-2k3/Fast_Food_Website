import express from "express"
import {
  sendMessage,
  adminSendMessage,
  getMessageUsers,
  getUserMessages,
  getMyMessages,
  markAsRead,
  deleteMessage,
  uploadImage,
  getUnreadCount,
  getAllMessages,
  getUserConversation,
  upload,
} from "../controllers/messageController.js"
import authMiddleware from "../middleware/auth.js"

const messageRouter = express.Router()

// User routes
messageRouter.post("/send", authMiddleware, upload.single("image"), sendMessage)
messageRouter.get("/my-messages", authMiddleware, getMyMessages)
messageRouter.get("/unread-count", authMiddleware, getUnreadCount)

// Admin routes
messageRouter.post("/admin-send", authMiddleware, upload.single("image"), adminSendMessage)
messageRouter.get("/users", authMiddleware, getMessageUsers)
messageRouter.get("/user/:userId", authMiddleware, getUserMessages)
messageRouter.get("/all", authMiddleware, getAllMessages)
messageRouter.get("/conversation/:userId", authMiddleware, getUserConversation)
messageRouter.post("/mark-read", authMiddleware, markAsRead)
messageRouter.post("/delete", authMiddleware, deleteMessage)
messageRouter.post("/upload-image", authMiddleware, upload.single("image"), uploadImage)

export default messageRouter
