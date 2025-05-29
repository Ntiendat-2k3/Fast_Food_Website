import express from "express"
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markNotificationRead,
  deleteNotification,
} from "../controllers/notificationController.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Create a new notification (admin only)
router.post("/create", auth, createNotification)

// Get all notifications (admin only)
router.get("/all", auth, getAllNotifications)

// Get notifications for the current user
router.get("/user", auth, getUserNotifications)

// Mark notification as read
router.post("/read", auth, markNotificationRead)

// Delete a notification (admin only)
router.post("/delete", auth, deleteNotification)

export default router
