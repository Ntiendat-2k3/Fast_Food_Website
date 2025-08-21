import notificationModel from "../models/notificationModel.js"
import userModel from "../models/userModel.js"

// Create notification
const createNotification = async (req, res) => {
  try {
    const { title, message, targetUser, type = "info" } = req.body
    // console.log("Creating notification:", { title, message, targetUser, type })
    // console.log("Creator userId:", req.userId)

    if (!title || !message) {
      return res.json({ success: false, message: "Thiếu tiêu đề hoặc nội dung" })
    }

    // Validate type
    const validTypes = ["info", "warning", "success"]
    if (!validTypes.includes(type)) {
      return res.json({ success: false, message: "Loại thông báo không hợp lệ" })
    }

    // Get creator info
    const creator = await userModel.findById(req.userId)
    if (!creator) {
      return res.json({ success: false, message: "Không tìm thấy người tạo" })
    }

    if (creator.role !== "admin" && creator.role !== "staff") {
      return res.json({ success: false, message: "Chỉ admin và staff mới có thể tạo thông báo" })
    }

    let targetUsers = []

    if (targetUser === "all") {
      // Send to all users (only regular users, not staff/admin)
      const allUsers = await userModel
        .find({
          role: "user",
          $or: [
            { isActive: { $exists: false } }, // For users without isActive field
            { isActive: true },
          ],
        })
        .select("_id")
      targetUsers = allUsers.map((user) => user._id)
      // console.log(`Found ${targetUsers.length} active users to send notification`)
    } else {
      // Send to specific user
      const specificUser = await userModel.findById(targetUser)
      if (!specificUser) {
        return res.json({ success: false, message: "Không tìm thấy người dùng được chỉ định" })
      }
      targetUsers = [targetUser]
      // console.log(`Sending notification to specific user: ${specificUser.name}`)
    }

    if (targetUsers.length === 0) {
      return res.json({ success: false, message: "Không có người dùng nào để gửi thông báo" })
    }

    // Create notifications for each target user
    const notifications = targetUsers.map((userId) => ({
      title,
      message,
      userId,
      type,
      createdBy: creator.role, // Save actual role (admin/staff) instead of hardcoded "admin"
      createdByUserId: creator._id, // Also save the creator's user ID for reference
      targetUser: targetUser === "all" ? "all" : targetUser,
      read: false,
      isRead: false,
      createdAt: new Date(),
    }))

    const result = await notificationModel.insertMany(notifications)
    // console.log(`Successfully created ${result.length} notifications`)

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
    // console.log("Getting all notifications for admin, requester userId:", req.userId)

    const notifications = await notificationModel
      .find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(100) // Limit to prevent too much data

    res.json({
      success: true,
      data: notifications,
      message: `Tìm thấy ${notifications.length} thông báo`,
    })
  } catch (error) {
    console.error("Error getting all notifications:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const userId = req.userId

    // console.log("Getting notifications for user:", userId, "page:", page, "limit:", limit)

    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin người dùng" })
    }

    const notifications = await notificationModel
      .find({
        userId: userId,
        createdBy: { $in: ["admin", "staff"] }, // Only show notifications from admin/staff
      })
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit))
      .skip((Number.parseInt(page) - 1) * Number.parseInt(limit))

    const total = await notificationModel.countDocuments({
      userId: userId,
      createdBy: { $in: ["admin", "staff"] }, // Count only notifications from admin/staff
    })

    // console.log(`Found ${notifications.length} notifications for user ${userId}, total: ${total}`)

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
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
    const userId = req.userId

    // console.log("Marking notification as read:", { id, read, userId })

    if (!id) {
      return res.json({ success: false, message: "Thiếu ID thông báo" })
    }

    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin người dùng" })
    }

    // Get user info to check role
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy thông tin người dùng" })
    }

    let notification

    // If user is admin or staff, they can mark any notification as read
    if (user.role === "admin" || user.role === "staff") {
      notification = await notificationModel.findById(id)
      // console.log("Admin/Staff marking notification as read:", id)
    } else {
      // Regular users can only mark their own notifications
      notification = await notificationModel.findOne({ _id: id, userId: userId })
      // console.log("User marking own notification as read:", id)
    }

    if (!notification) {
      return res.json({ success: false, message: "Không tìm thấy thông báo hoặc bạn không có quyền truy cập" })
    }

    // Update notification
    const updatedNotification = await notificationModel.findByIdAndUpdate(
      id,
      {
        read: read,
        isRead: read,
        readAt: read ? new Date() : null,
      },
      { new: true },
    )

    // console.log("Notification updated successfully:", updatedNotification._id)

    res.json({
      success: true,
      message: read ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc",
      data: updatedNotification,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId
    // console.log("Marking all notifications as read for user:", userId)

    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin người dùng" })
    }

    const result = await notificationModel.updateMany(
      { userId: userId, $or: [{ read: { $ne: true } }, { isRead: { $ne: true } }] },
      {
        read: true,
        isRead: true,
        readAt: new Date(),
      },
    )

    // console.log(`Marked ${result.modifiedCount} notifications as read`)

    res.json({
      success: true,
      message: `Đã đánh dấu ${result.modifiedCount} thông báo là đã đọc`,
      data: { modifiedCount: result.modifiedCount },
    })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.body
    // console.log("Deleting notification:", id, "by user:", req.userId)

    if (!id) {
      return res.json({ success: false, message: "Thiếu ID thông báo" })
    }

    const notification = await notificationModel.findByIdAndDelete(id)
    if (!notification) {
      return res.json({ success: false, message: "Không tìm thấy thông báo" })
    }

    // console.log("Notification deleted successfully:", id)

    res.json({ success: true, message: "Đã xóa thông báo thành công" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Delete multiple notifications
const deleteMultipleNotifications = async (req, res) => {
  try {
    const { ids } = req.body
    // console.log("Deleting multiple notifications:", ids, "by user:", req.userId)

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({ success: false, message: "Thiếu danh sách ID thông báo" })
    }

    const result = await notificationModel.deleteMany({ _id: { $in: ids } })

    // console.log(`Deleted ${result.deletedCount} notifications successfully`)

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} thông báo thành công`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting multiple notifications:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Delete all notifications (admin only)
const deleteAllNotifications = async (req, res) => {
  try {
    const { type } = req.body // "all", "orders", "created"
    // console.log("Deleting all notifications, type:", type, "by user:", req.userId)

    let deleteQuery = {}

    if (type === "orders") {
      // Delete only order notifications
      deleteQuery = {
        $or: [{ title: { $regex: /đơn hàng|order/i } }, { message: { $regex: /đơn hàng|order/i } }, { type: "order" }],
      }
    } else if (type === "created") {
      // Delete only created notifications (not order notifications)
      deleteQuery = {
        $and: [
          { title: { $not: { $regex: /đơn hàng|order/i } } },
          { message: { $not: { $regex: /đơn hàng|order/i } } },
          { type: { $ne: "order" } },
        ],
      }
    }
    // If type is "all" or undefined, deleteQuery remains {} (delete all)

    const result = await notificationModel.deleteMany(deleteQuery)

    // console.log(`Deleted ${result.deletedCount} notifications of type: ${type || "all"}`)

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} thông báo thành công`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting all notifications:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId
    // console.log("Getting unread count for user:", userId)

    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy thông tin người dùng" })
    }

    const count = await notificationModel.countDocuments({
      userId: userId,
      createdBy: { $in: ["admin", "staff"] }, // Only count notifications from admin/staff
      $or: [{ read: { $ne: true } }, { isRead: { $ne: true } }],
    })

    res.json({ success: true, data: { count } })
  } catch (error) {
    console.error("Error getting unread count:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

export {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllNotifications,
  getUnreadCount,
}
