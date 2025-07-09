import notificationModel from "../models/notificationModel.js"
import userModel from "../models/userModel.js"

// Create notification
const createNotification = async (req, res) => {
  try {
    const { title, message, targetUser, type = "info" } = req.body
    console.log("Creating notification:", { title, message, targetUser, type })

    if (!title || !message) {
      return res.json({ success: false, message: "Thiếu tiêu đề hoặc nội dung" })
    }

    // Get creator info
    const creator = await userModel.findById(req.userId)
    if (!creator) {
      return res.json({ success: false, message: "Không tìm thấy người tạo" })
    }

    let targetUsers = []

    if (targetUser === "all") {
      // Send to all users
      const allUsers = await userModel.find({ role: "user" }).select("_id")
      targetUsers = allUsers.map((user) => user._id)
    } else {
      // Send to specific user
      targetUsers = [targetUser]
    }

    // Create notifications for each target user
    const notifications = targetUsers.map((userId) => ({
      title,
      message,
      userId,
      type,
      createdBy: creator.name,
      createdAt: new Date(),
    }))

    const result = await notificationModel.insertMany(notifications)
    console.log(`Created ${result.length} notifications`)

    res.json({
      success: true,
      message: `Đã tạo ${result.length} thông báo thành công`,
      data: result,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get all notifications (admin)
const getAllNotifications = async (req, res) => {
  try {
    console.log("Getting all notifications, requester role:", req.userRole)

    const notifications = await notificationModel.find({}).populate("userId", "name email").sort({ createdAt: -1 })

    console.log(`Found ${notifications.length} notifications`)

    res.json({
      success: true,
      data: notifications,
      message: `Tìm thấy ${notifications.length} thông báo`,
    })
  } catch (error) {
    console.error("Error getting notifications:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const userId = req.userId

    const notifications = await notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await notificationModel.countDocuments({ userId })

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error getting user notifications:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id, read = true } = req.body
    console.log("Marking notification as read:", { id, read })

    if (!id) {
      return res.json({ success: false, message: "Thiếu ID thông báo" })
    }

    const notification = await notificationModel.findByIdAndUpdate(
      id,
      { read, readAt: read ? new Date() : null },
      { new: true },
    )

    if (!notification) {
      return res.json({ success: false, message: "Không tìm thấy thông báo" })
    }

    res.json({
      success: true,
      message: read ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc",
      data: notification,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.body
    console.log("Deleting notification:", id)

    if (!id) {
      return res.json({ success: false, message: "Thiếu ID thông báo" })
    }

    const notification = await notificationModel.findByIdAndDelete(id)
    if (!notification) {
      return res.json({ success: false, message: "Không tìm thấy thông báo" })
    }

    res.json({ success: true, message: "Đã xóa thông báo thành công" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId
    const count = await notificationModel.countDocuments({
      userId,
      read: { $ne: true },
    })

    res.json({ success: true, data: { count } })
  } catch (error) {
    console.error("Error getting unread count:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

export { createNotification, getAllNotifications, getUserNotifications, markAsRead, deleteNotification, getUnreadCount }
