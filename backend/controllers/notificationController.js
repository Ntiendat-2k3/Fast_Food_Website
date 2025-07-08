import notificationModel from "../models/notificationModel.js"
import userModel from "../models/userModel.js"

// Create notification
const createNotification = async (req, res) => {
  try {
    console.log("Creating notification:", req.body)

    const { userId, title, message, type } = req.body
    const createdBy = req.user._id

    // Validate required fields
    if (!userId || !title || !message) {
      return res.json({
        success: false,
        message: "User ID, title, and message are required",
      })
    }

    // Check if user exists
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    // Create notification
    const notification = new notificationModel({
      userId,
      title,
      message,
      type: type || "info",
      createdBy,
      isRead: false,
    })

    await notification.save()

    console.log("Notification created successfully:", notification._id)
    res.json({
      success: true,
      message: "Notification created successfully",
      notification,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    res.json({
      success: false,
      message: "Error creating notification",
    })
  }
}

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    console.log("Getting notifications for user:", userId)

    const notifications = await notificationModel.find({ userId }).populate("createdBy", "name").sort({ createdAt: -1 })

    console.log(`Found ${notifications.length} notifications for user`)
    res.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("Error getting notifications:", error)
    res.json({
      success: false,
      message: "Error getting notifications",
    })
  }
}

// Get all notifications (admin/staff only)
const getAllNotifications = async (req, res) => {
  try {
    console.log("Getting all notifications for admin/staff")

    const notifications = await notificationModel
      .find({})
      .populate("userId", "name email")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })

    console.log(`Found ${notifications.length} total notifications`)
    res.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("Error getting all notifications:", error)
    res.json({
      success: false,
      message: "Error getting notifications",
    })
  }
}

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    console.log("Marking notification as read:", id, "by user:", userId)

    const notification = await notificationModel.findById(id)
    if (!notification) {
      return res.json({
        success: false,
        message: "Notification not found",
      })
    }

    // Check if user owns the notification or is admin/staff
    if (
      notification.userId.toString() !== userId.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.json({
        success: false,
        message: "Not authorized to mark this notification as read",
      })
    }

    const updatedNotification = await notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true })

    console.log("Notification marked as read successfully:", id)
    res.json({
      success: true,
      message: "Notification marked as read",
      notification: updatedNotification,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.json({
      success: false,
      message: "Error marking notification as read",
    })
  }
}

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    console.log("Deleting notification:", id, "by user:", userId)

    const notification = await notificationModel.findById(id)
    if (!notification) {
      return res.json({
        success: false,
        message: "Notification not found",
      })
    }

    // Check if user owns the notification or is admin/staff
    if (
      notification.userId.toString() !== userId.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.json({
        success: false,
        message: "Not authorized to delete this notification",
      })
    }

    await notificationModel.findByIdAndDelete(id)

    console.log("Notification deleted successfully:", id)
    res.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.json({
      success: false,
      message: "Error deleting notification",
    })
  }
}

// Send bulk notification (admin/staff only)
const sendBulkNotification = async (req, res) => {
  try {
    console.log("Sending bulk notification:", req.body)

    const { userIds, title, message, type } = req.body
    const createdBy = req.user._id

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.json({
        success: false,
        message: "User IDs array is required",
      })
    }

    if (!title || !message) {
      return res.json({
        success: false,
        message: "Title and message are required",
      })
    }

    // Create notifications for all users
    const notifications = userIds.map((userId) => ({
      userId,
      title,
      message,
      type: type || "info",
      createdBy,
      isRead: false,
    }))

    const result = await notificationModel.insertMany(notifications)

    console.log(`Bulk notification sent to ${result.length} users`)
    res.json({
      success: true,
      message: `Notification sent to ${result.length} users`,
      count: result.length,
    })
  } catch (error) {
    console.error("Error sending bulk notification:", error)
    res.json({
      success: false,
      message: "Error sending bulk notification",
    })
  }
}

export {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  getAllNotifications,
  sendBulkNotification,
}
