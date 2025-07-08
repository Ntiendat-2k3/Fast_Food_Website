import express from "express"
import {
  createNotification,
  getNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
} from "../controllers/notificationController.js"
import { requireSignIn, verifyAdminOrStaff } from "../middleware/auth.js"

const notificationRouter = express.Router()

// User routes (require authentication)
notificationRouter.get("/", requireSignIn, getNotifications)
notificationRouter.put("/read/:id", requireSignIn, markAsRead)
notificationRouter.put("/read-all", requireSignIn, markAllAsRead)

// Admin/Staff routes - Staff can now manage notifications
notificationRouter.post("/create", verifyAdminOrStaff, createNotification)
notificationRouter.get("/all", verifyAdminOrStaff, getAllNotifications)
notificationRouter.get("/stats", verifyAdminOrStaff, getNotificationStats)
notificationRouter.delete("/delete/:id", verifyAdminOrStaff, deleteNotification)

export default notificationRouter
