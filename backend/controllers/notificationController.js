import notificationModel from "../models/notificationModel.js"

// Tạo notification mới
const createNotification = async (req, res) => {
  try {
    const { title, message, type, orderId, userId } = req.body

    const newNotification = new notificationModel({
      title,
      message,
      type,
      orderId,
      userId,
      createdAt: new Date(),
    })

    await newNotification.save()

    // Emit notification to admin via socket
    if (req.io) {
      req.io.emit("newNotification", {
        id: newNotification._id,
        title,
        message,
        type,
        orderId,
        userId,
        createdAt: newNotification.createdAt,
        isRead: false,
      })
    }

    res.json({ success: true, data: newNotification })
  } catch (error) {
    console.log("Error creating notification:", error)
    res.json({ success: false, message: "Lỗi khi tạo thông báo" })
  }
}

// Lấy danh sách notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query

    const query = {}
    if (isRead !== undefined) {
      query.isRead = isRead === "true"
    }

    const notifications = await notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await notificationModel.countDocuments(query)
    const unreadCount = await notificationModel.countDocuments({ isRead: false })

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        page: Number.parseInt(page),
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.log("Error getting notifications:", error)
    res.json({ success: false, message: "Lỗi khi lấy thông báo" })
  }
}

// Đánh dấu notification đã đọc
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    await notificationModel.findByIdAndUpdate(notificationId, {
      isRead: true,
      readAt: new Date(),
    })

    res.json({ success: true, message: "Đã đánh dấu đã đọc" })
  } catch (error) {
    console.log("Error marking notification as read:", error)
    res.json({ success: false, message: "Lỗi khi đánh dấu đã đọc" })
  }
}

// Đánh dấu tất cả đã đọc
const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany({ isRead: false }, { isRead: true, readAt: new Date() })

    res.json({ success: true, message: "Đã đánh dấu tất cả đã đọc" })
  } catch (error) {
    console.log("Error marking all notifications as read:", error)
    res.json({ success: false, message: "Lỗi khi đánh dấu tất cả đã đọc" })
  }
}

// Xóa notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params

    await notificationModel.findByIdAndDelete(notificationId)

    res.json({ success: true, message: "Đã xóa thông báo" })
  } catch (error) {
    console.log("Error deleting notification:", error)
    res.json({ success: false, message: "Lỗi khi xóa thông báo" })
  }
}

export { createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification }
