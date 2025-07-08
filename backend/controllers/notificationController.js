import notificationModel from "../models/notificationModel.js"
import userModel from "../models/userModel.js"

// Create notification (Admin/Staff only)
const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetUsers } = req.body
    const createdById = req.body.userId

    if (!title || !message) {
      return res.json({ success: false, message: "Title and message are required" })
    }

    const validTypes = ["info", "warning", "success", "error"]
    if (type && !validTypes.includes(type)) {
      return res.json({ success: false, message: "Invalid notification type" })
    }

    let recipients = []

    if (targetUsers === "all") {
      // Send to all users
      const allUsers = await userModel.find({ role: "user" }).select("_id")
      recipients = allUsers.map((user) => user._id)
    } else if (Array.isArray(targetUsers)) {
      // Send to specific users
      recipients = targetUsers
    } else {
      return res.json({ success: false, message: "Invalid target users" })
    }

    // Create notifications for each recipient
    const notifications = recipients.map((userId) => ({
      userId,
      title,
      message,
      type: type || "info",
      createdById,
    }))

    await notificationModel.insertMany(notifications)

    const creator = await userModel.findById(createdById)
    console.log(`Notification "${title}" created by ${creator.name} (${creator.role}) for ${recipients.length} users`)

    res.json({
      success: true,
      message: `Notification sent to ${recipients.length} users`,
      recipientCount: recipients.length,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error creating notification" })
  }
}

// Get notifications for user
const getNotifications = async (req, res) => {
  try {
    const userId = req.body.userId
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    console.log("Getting notifications for user:", userId)

    const notifications = await notificationModel.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 })

    const total = await notificationModel.countDocuments({ userId })
    const unreadCount = await notificationModel.countDocuments({ userId, isRead: false })

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalNotifications: total,
      },
    })
  } catch (error) {
    console.error("Error getting notifications:", error)
    res.json({ success: false, message: "Error fetching notifications" })
  }
}

// Get all notifications (Admin/Staff only)
const getAllNotifications = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const notifications = await notificationModel
      .find({})
      .populate("userId", "name email")
      .populate("createdById", "name role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await notificationModel.countDocuments({})

    res.json({
      success: true,
      notifications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: notifications.length,
        totalNotifications: total,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching all notifications" })
  }
}

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.body.userId

    if (!id) {
      return res.json({ success: false, message: "Notification ID is required" })
    }

    const notification = await notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    )

    if (!notification) {
      return res.json({ success: false, message: "Notification not found" })
    }

    res.json({ success: true, message: "Notification marked as read" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error marking notification as read" })
  }
}

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.body.userId

    await notificationModel.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() })

    res.json({ success: true, message: "All notifications marked as read" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error marking all notifications as read" })
  }
}

// Delete notification (Admin/Staff only)
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const deletedBy = req.body.userId

    if (!id) {
      return res.json({ success: false, message: "Notification ID is required" })
    }

    const notification = await notificationModel.findById(id)
    if (!notification) {
      return res.json({ success: false, message: "Notification not found" })
    }

    await notificationModel.findByIdAndDelete(id)

    const user = await userModel.findById(deletedBy)
    console.log(`Notification ${id} deleted by ${user.name} (${user.role})`)

    res.json({ success: true, message: "Notification deleted successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error deleting notification" })
  }
}

// Get notification statistics (Admin/Staff only)
const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await notificationModel.countDocuments({})
    const readNotifications = await notificationModel.countDocuments({ isRead: true })
    const unreadNotifications = await notificationModel.countDocuments({ isRead: false })

    const typeStats = await notificationModel.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])

    res.json({
      success: true,
      stats: {
        total: totalNotifications,
        read: readNotifications,
        unread: unreadNotifications,
        byType: typeStats,
      },
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error fetching notification statistics" })
  }
}

export {
  createNotification,
  getNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
}
