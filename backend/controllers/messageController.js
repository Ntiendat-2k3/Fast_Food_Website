import messageModel from "../models/messageModel.js"
import userModel from "../models/userModel.js"
import multer from "multer"
import path from "path"
import fs from "fs"

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/messages/"
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Send message from user to admin
const sendMessage = async (req, res) => {
  try {
    const { message, type = "text" } = req.body
    const userId = req.userId

    if (!message) {
      return res.json({ success: false, message: "Nội dung tin nhắn không được để trống" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    const newMessage = new messageModel({
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      content: message,
      type: type,
      sender: "user",
      isRead: false,
    })

    await newMessage.save()

    res.json({
      success: true,
      message: "Đã gửi tin nhắn thành công",
      data: newMessage,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Send message from admin to user
const adminSendMessage = async (req, res) => {
  try {
    const { userId, message, type = "text" } = req.body

    if (!userId || !message) {
      return res.json({ success: false, message: "Thiếu thông tin userId hoặc message" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    const adminUser = await userModel.findById(req.userId)
    const adminName = adminUser ? adminUser.name : "Admin"

    const newMessage = new messageModel({
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      content: message,
      type: type,
      sender: "admin",
      adminName: adminName,
      isRead: true, // Admin messages are marked as read by default
    })

    await newMessage.save()

    res.json({
      success: true,
      message: "Đã gửi tin nhắn thành công",
      data: newMessage,
    })
  } catch (error) {
    console.error("Error sending admin message:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get all users who have sent messages (for admin)
const getMessageUsers = async (req, res) => {
  try {
    console.log("Getting message users, requester role:", req.userRole)

    // Aggregate to get unique users with their latest message info
    const users = await messageModel.aggregate([
      {
        $group: {
          _id: "$userId",
          name: { $first: "$userName" },
          email: { $first: "$userEmail" },
          latestMessage: { $last: "$content" },
          latestMessageTime: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$sender", "user"] }, { $eq: ["$isRead", false] }] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { latestMessageTime: -1 },
      },
    ])

    console.log(`Found ${users.length} users with messages`)

    res.json({
      success: true,
      data: users,
      message: `Tìm thấy ${users.length} người dùng`,
    })
  } catch (error) {
    console.error("Error getting message users:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get messages for a specific user (for admin)
const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.json({ success: false, message: "Thiếu userId" })
    }

    console.log("Getting messages for user:", userId)

    const messages = await messageModel.find({ userId }).sort({ createdAt: 1 })

    console.log(`Found ${messages.length} messages for user ${userId}`)

    res.json({
      success: true,
      data: messages,
      message: `Tìm thấy ${messages.length} tin nhắn`,
    })
  } catch (error) {
    console.error("Error getting user messages:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get messages for current user
const getMyMessages = async (req, res) => {
  try {
    const userId = req.userId

    console.log("Getting messages for current user:", userId)

    const messages = await messageModel.find({ userId }).sort({ createdAt: 1 })

    // Mark user messages as read
    await messageModel.updateMany({ userId, sender: "admin", isRead: false }, { isRead: true })

    console.log(`Found ${messages.length} messages for current user`)

    res.json({
      success: true,
      data: messages,
      message: `Tìm thấy ${messages.length} tin nhắn`,
    })
  } catch (error) {
    console.error("Error getting my messages:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.json({ success: false, message: "Thiếu userId" })
    }

    await messageModel.updateMany({ userId, sender: "user", isRead: false }, { isRead: true })

    res.json({
      success: true,
      message: "Đã đánh dấu tin nhắn đã đọc",
    })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.body

    if (!messageId) {
      return res.json({ success: false, message: "Thiếu messageId" })
    }

    const message = await messageModel.findByIdAndDelete(messageId)
    if (!message) {
      return res.json({ success: false, message: "Tin nhắn không tồn tại" })
    }

    // If it's an image message, try to delete the file
    if (message.type === "image" && message.content.includes("/uploads/")) {
      const imagePath = message.content.replace("http://localhost:4000/", "")
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    res.json({
      success: true,
      message: "Đã xóa tin nhắn thành công",
    })
  } catch (error) {
    console.error("Error deleting message:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Upload image for message
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "Không có file được upload" })
    }

    const imageUrl = `http://localhost:4000/uploads/messages/${req.file.filename}`

    res.json({
      success: true,
      imageUrl: imageUrl,
      message: "Upload hình ảnh thành công",
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get unread message count for user
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId

    const count = await messageModel.countDocuments({
      userId,
      sender: "admin",
      isRead: false,
    })

    res.json({
      success: true,
      count: count,
    })
  } catch (error) {
    console.error("Error getting unread count:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

export {
  sendMessage,
  adminSendMessage,
  getMessageUsers,
  getUserMessages,
  getMyMessages,
  markAsRead,
  deleteMessage,
  uploadImage,
  getUnreadCount,
  upload,
}
