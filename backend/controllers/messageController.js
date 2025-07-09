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
    const userId = req.userId
    let { content } = req.body

    console.log("User sending message:", { userId, content, hasFile: !!req.file })

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    let messageType = "text"
    let imagePath = null

    // Handle image upload
    if (req.file) {
      imagePath = req.file.filename
      messageType = "image"
      if (!content) {
        content = "Đã gửi một hình ảnh"
      }
    }

    if (!content && !imagePath) {
      return res.json({ success: false, message: "Nội dung tin nhắn không được để trống" })
    }

    const newMessage = new messageModel({
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      content: content || "",
      type: messageType,
      sender: "user",
      isRead: false,
      image: imagePath,
    })

    await newMessage.save()

    console.log("User message saved successfully:", newMessage._id)

    res.json({
      success: true,
      message: "Đã gửi tin nhắn thành công",
      data: newMessage,
    })
  } catch (error) {
    console.error("Error sending user message:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Send message from admin to user
const adminSendMessage = async (req, res) => {
  try {
    let { userId, content } = req.body

    console.log("Admin sending message:", { userId, content, hasFile: !!req.file })

    if (!userId) {
      return res.json({ success: false, message: "Thiếu thông tin userId" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    const adminUser = await userModel.findById(req.userId)
    const adminName = adminUser ? adminUser.name : "Admin"

    let messageType = "text"
    let imagePath = null

    // Handle image upload
    if (req.file) {
      imagePath = req.file.filename
      messageType = "image"
      if (!content) {
        content = "Đã gửi một hình ảnh"
      }
    }

    if (!content && !imagePath) {
      return res.json({ success: false, message: "Nội dung tin nhắn không được để trống" })
    }

    const newMessage = new messageModel({
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      content: content || "",
      type: messageType,
      sender: "admin",
      adminName: adminName,
      isRead: false,
      image: imagePath,
    })

    await newMessage.save()

    console.log("Admin message saved successfully:", newMessage._id)

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

// Get messages for current user (FIXED - this is the key function for frontend)
const getMyMessages = async (req, res) => {
  try {
    const userId = req.userId

    console.log("Getting messages for current user:", userId)

    // Get ALL messages for this user (both sent by user and received from admin)
    const messages = await messageModel.find({ userId }).sort({ createdAt: 1 })

    console.log(`Found ${messages.length} messages for current user ${userId}`)

    // Mark admin messages as read when user views them
    await messageModel.updateMany({ userId, sender: "admin", isRead: false }, { isRead: true })

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

// Get all users who have sent messages (for admin)
const getMessageUsers = async (req, res) => {
  try {
    console.log("Getting message users")

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
    if (message.image) {
      const imagePath = `uploads/messages/${message.image}`
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

// Get all messages (for admin)
const getAllMessages = async (req, res) => {
  try {
    console.log("Getting all messages")

    const messages = await messageModel.find({}).sort({ createdAt: -1 }).limit(100)

    console.log(`Found ${messages.length} messages`)

    res.json({
      success: true,
      data: messages,
      message: `Tìm thấy ${messages.length} tin nhắn`,
    })
  } catch (error) {
    console.error("Error getting all messages:", error)
    res.json({ success: false, message: "Lỗi server: " + error.message })
  }
}

// Get conversation between admin and specific user
const getUserConversation = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.json({ success: false, message: "Thiếu userId" })
    }

    console.log("Getting conversation for user:", userId)

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" })
    }

    const messages = await messageModel.find({ userId }).sort({ createdAt: 1 })

    // Mark user messages as read when admin views conversation
    await messageModel.updateMany({ userId, sender: "user", isRead: false }, { isRead: true })

    console.log(`Found ${messages.length} messages in conversation with user ${userId}`)

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        messages: messages,
      },
      message: `Tìm thấy ${messages.length} tin nhắn`,
    })
  } catch (error) {
    console.error("Error getting user conversation:", error)
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
  getAllMessages,
  getUserConversation,
  upload,
}
