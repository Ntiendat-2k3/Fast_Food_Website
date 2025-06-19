import express from "express"
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js"

const notificationRouter = express.Router()

notificationRouter.post("/create", createNotification)
notificationRouter.get("/list", getNotifications)
notificationRouter.put("/read/:notificationId", markAsRead)
notificationRouter.put("/read-all", markAllAsRead)
notificationRouter.delete("/:notificationId", deleteNotification)

export default notificationRouter
