import express from "express"
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notificationController.js"
import { authMiddleware, verifyStaffOrAdmin } from "../middleware/auth.js"

const notificationRouter = express.Router()

// User routes
notificationRouter.get("/list", authMiddleware, getUserNotifications)
notificationRouter.get("/unread-count", authMiddleware, getUnreadCount)
notificationRouter.post("/read", authMiddleware, markAsRead)

// Admin/Staff routes
notificationRouter.get("/all", verifyStaffOrAdmin, getAllNotifications)
notificationRouter.post("/create", verifyStaffOrAdmin, createNotification)
notificationRouter.post("/delete", verifyStaffOrAdmin, deleteNotification)

export default notificationRouter
