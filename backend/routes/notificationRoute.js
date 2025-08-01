import express from "express"
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notificationController.js"
import requireSignIn, { verifyStaffOrAdmin } from "../middleware/auth.js"

const notificationRouter = express.Router()

// Admin routes - for creating and managing all notifications
notificationRouter.post("/create", verifyStaffOrAdmin, createNotification)
notificationRouter.get("/admin/list", verifyStaffOrAdmin, getAllNotifications)
notificationRouter.delete("/delete", verifyStaffOrAdmin, deleteNotification)

// User routes - for users to manage their own notifications
notificationRouter.get("/list", requireSignIn, getUserNotifications)
notificationRouter.get("/unread-count", requireSignIn, getUnreadCount)
notificationRouter.post("/read", requireSignIn, markAsRead)
notificationRouter.post("/mark-all-read", requireSignIn, markAllAsRead)

export default notificationRouter
