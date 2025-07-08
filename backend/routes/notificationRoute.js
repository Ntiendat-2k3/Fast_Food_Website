import express from "express"
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  getAllNotifications,
  sendBulkNotification,
} from "../controllers/notificationController.js"
import { requireSignIn, verifyAdminOrStaff } from "../middleware/auth.js"

const notificationRouter = express.Router()

// User routes (require authentication)
notificationRouter.get("/user", requireSignIn, getNotifications)
notificationRouter.put("/read/:id", requireSignIn, markAsRead)
notificationRouter.delete("/delete/:id", requireSignIn, deleteNotification)

// Admin/Staff routes
notificationRouter.post("/create", verifyAdminOrStaff, createNotification)
notificationRouter.get("/all", verifyAdminOrStaff, getAllNotifications)
notificationRouter.post("/bulk", verifyAdminOrStaff, sendBulkNotification)

export default notificationRouter
