import messageModel from "../models/messageModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Auto-response message
const AUTO_RESPONSE = "Bạn đợi một chút, sẽ có nhân viên phản hồi ạ. Cảm ơn bạn đã liên hệ với chúng tôi!"

const hasAutoResponseBeenSent = async (userId) => {
  try {
    const autoResponse = await messageModel.findOne({
      recipientId: userId,
      isAdmin: true,
      isAutoResponse: true,
    })
    return !!autoResponse
  } catch (error) {
    console.error("Error checking for auto-response:", error)
    return false
  }
}

const sendMessage = async (req, res) => {
  try {
    const { content, userId } = req.body
    const senderId = req.user._id

    const user = await userModel.findById(senderId)
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    let imagePath = null
    if (req.file) {
      imagePath = `chat/${path.basename(req.file.path)}`
    }

    // Create new message
    const newMessage = new messageModel({
      userId: user.role === "admin" ? userId : senderId, // If admin, use the target userId
      userName: user.name,
      content: content || "",
      image: imagePath,
      isAdmin: user.role === "admin",
      recipientId: user.role === "admin" ? userId : null, // Store the recipient ID for admin messages
    })

    await newMessage.save()

    let autoResponse = null
    if (user.role !== "admin") {
      const alreadySentAutoResponse = await hasAutoResponseBeenSent(senderId)

      if (!alreadySentAutoResponse) {
        autoResponse = new messageModel({
          userId: senderId, // The user who will receive this message
          userName: "Hệ thống", // System name
          content: AUTO_RESPONSE,
          isAdmin: true, // Auto-responses appear as admin messages
          recipientId: senderId, // Explicitly set the recipient
          read: false,
          isAutoResponse: true, // Flag to identify auto-responses
        })

        await autoResponse.save()
      }
    }

    res.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
      autoResponse: autoResponse,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.json({ success: false, message: "Error sending message" })
  }
}

const getUserMessages = async (req, res) => {
  try {
    const userId = req.user._id

    const messages = await messageModel
      .find({
        $or: [
          { userId }, // Messages from this user
          { recipientId: userId, isAdmin: true }, // Admin messages to this user
        ],
      })
      .sort({ createdAt: 1 })

    res.json({ success: true, data: messages })
  } catch (error) {
    console.error("Error getting messages:", error)
    res.json({ success: false, message: "Error getting messages" })
  }
}

// Get all messages (admin only)
const getAllMessages = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized" })
    }

    // Get all unique users who have sent messages
    const users = await messageModel.aggregate([
      { $match: { isAdmin: false } },
      { $group: { _id: "$userId", userName: { $first: "$userName" }, lastMessage: { $max: "$createdAt" } } },
      { $sort: { lastMessage: -1 } },
    ])

    res.json({ success: true, data: users })
  } catch (error) {
    console.error("Error getting all messages:", error)
    res.json({ success: false, message: "Error getting all messages" })
  }
}

const getUserConversation = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Unauthorized" })
    }

    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: "Invalid user ID" })
    }

    const messages = await messageModel
      .find({
        $or: [
          { userId, isAdmin: false },
          { recipientId: userId, isAdmin: true },
        ],
      })
      .sort({ createdAt: 1 })

    await messageModel.updateMany({ userId, isAdmin: false, read: false }, { $set: { read: true } })

    res.json({ success: true, data: messages })
  } catch (error) {
    console.error("Error getting conversation:", error)
    res.json({ success: false, message: "Error getting conversation" })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.json({ success: false, message: "Invalid message ID" })
    }

    await messageModel.findByIdAndUpdate(messageId, { read: true })

    res.json({ success: true, message: "Message marked as read" })
  } catch (error) {
    console.error("Error marking message as read:", error)
    res.json({ success: false, message: "Error marking message as read" })
  }
}

export { sendMessage, getUserMessages, getAllMessages, getUserConversation, markAsRead }
