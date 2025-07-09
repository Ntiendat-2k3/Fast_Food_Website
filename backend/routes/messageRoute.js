import express from "express"
import {
  sendMessage,
  adminSendMessage,
  getMessageUsers,
  getUserMessages,
  getAllMessages,
  getUserConversation,
  getMyMessages,
  markAsRead,
  deleteMessage,
  uploadImage,
  getUnreadCount,
  upload,
} from "../controllers/messageController.js"
import requireSignIn from "../middleware/auth.js"

const router = express.Router()

// User routes
router.post("/send", requireSignIn, upload.single("image"), sendMessage)
router.get("/my-messages", requireSignIn, getMyMessages)
router.get("/unread-count", requireSignIn, getUnreadCount)

// Admin routes
router.get("/users", requireSignIn, getMessageUsers)
router.get("/all", requireSignIn, getAllMessages)
router.get("/user/:userId", requireSignIn, getUserMessages)
router.get("/conversation/:userId", requireSignIn, getUserConversation)
router.post("/admin-send", requireSignIn, upload.single("image"), adminSendMessage)
router.post("/mark-read", requireSignIn, markAsRead)
router.post("/delete", requireSignIn, deleteMessage)

// Image upload route
router.post("/upload-image", requireSignIn, upload.single("image"), uploadImage)

export default router
