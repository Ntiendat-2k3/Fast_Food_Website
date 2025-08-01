import express from "express"
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllNotifications,
  getUnreadCount,
} from "../controllers/notificationController.js"
import requireSignIn, { verifyStaffOrAdmin } from "../middleware/auth.js"

const notificationRouter = express.Router()

// Admin routes - for creating and managing all notifications
notificationRouter.post("/create", verifyStaffOrAdmin, createNotification)
notificationRouter.get("/admin/list", verifyStaffOrAdmin, getAllNotifications)
notificationRouter.post("/delete", verifyStaffOrAdmin, deleteNotification)
notificationRouter.post("/delete-multiple", verifyStaffOrAdmin, deleteMultipleNotifications)
notificationRouter.post("/delete-all", verifyStaffOrAdmin, deleteAllNotifications)

// User routes - for users to manage their own notifications
notificationRouter.get("/list", requireSignIn, getUserNotifications)
notificationRouter.get("/unread-count", requireSignIn, getUnreadCount)
notificationRouter.post("/read", requireSignIn, markAsRead) // Both users and admin/staff can use this
notificationRouter.post("/mark-all-read", requireSignIn, markAllAsRead)

export default notificationRouter
