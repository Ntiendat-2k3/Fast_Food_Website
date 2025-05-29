import notificationModel from "../models/notificationModel.js"
import mongoose from "mongoose"

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetUser } = req.body

    // Validate required fields
    if (!title || !message) {
      return res.json({ success: false, message: "Tiêu đề và nội dung thông báo không được để trống" })
    }

    // Create new notification
    const newNotification = new notificationModel({
      title,
      message,
      type: type || "info",
      targetUser: targetUser || "all",
    })

    const savedNotification = await newNotification.save()

    res.json({
      success: true,
      message: "Tạo thông báo thành công",
      notification: savedNotification,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    res.json({ success: false, message: "Lỗi khi tạo thông báo" })
  }
}

// Get all notifications (for admin)
const getAllNotifications = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    const notifications = await notificationModel.find({}).sort({ createdAt: -1 })

    res.json({ success: true, data: notifications })
  } catch (error) {
    console.error("Error getting all notifications:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách thông báo" })
  }
}

// Get notifications for a specific user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id

    // Get notifications targeted to this user or to all users
    const notifications = await notificationModel
      .find({
        $or: [{ targetUser: userId.toString() }, { targetUser: "all" }],
      })
      .sort({ createdAt: -1 })

    res.json({ success: true, data: notifications })
  } catch (error) {
    console.error("Error getting user notifications:", error)
    res.json({ success: false, message: "Lỗi khi lấy thông báo" })
  }
}

// Mark notification as read
const markNotificationRead = async (req, res) => {
  try {
    const { id, read } = req.body

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID thông báo không hợp lệ" })
    }

    const updatedNotification = await notificationModel.findByIdAndUpdate(
      id,
      { read: read !== undefined ? read : true },
      { new: true },
    )

    if (!updatedNotification) {
      return res.json({ success: false, message: "Không tìm thấy thông báo" })
    }

    res.json({
      success: true,
      message: read !== false ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc",
      notification: updatedNotification,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật trạng thái thông báo" })
  }
}

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.body

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID thông báo không hợp lệ" })
    }

    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    const deletedNotification = await notificationModel.findByIdAndDelete(id)

    if (!deletedNotification) {
      return res.json({ success: false, message: "Không tìm thấy thông báo" })
    }

    res.json({ success: true, message: "Xóa thông báo thành công" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.json({ success: false, message: "Lỗi khi xóa thông báo" })
  }
}

export { createNotification, getAllNotifications, getUserNotifications, markNotificationRead, deleteNotification }
