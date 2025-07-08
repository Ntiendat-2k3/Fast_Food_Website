import messageModel from "../models/messageModel.js"
import userModel from "../models/userModel.js"

// Send a message
const sendMessage = async (req, res) => {
  try {
    console.log("Sending message:", req.body)

    const { receiverId, message, images } = req.body
    const senderId = req.user._id

    // Validate required fields
    if (!receiverId || !message) {
      return res.json({
        success: false,
        message: "Receiver ID and message are required",
      })
    }

    // Check if receiver exists
    const receiver = await userModel.findById(receiverId)
    if (!receiver) {
      return res.json({
        success: false,
        message: "Receiver not found",
      })
    }

    // Create new message
    const newMessage = new messageModel({
      senderId,
      receiverId,
      message,
      images: images || [],
      isRead: false,
    })

    await newMessage.save()

    console.log("Message sent successfully:", newMessage._id)
    res.json({
      success: true,
      message: "Message sent successfully",
      messageData: newMessage,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.json({
      success: false,
      message: "Error sending message",
    })
  }
}

// Get user messages
const getUserMessages = async (req, res) => {
  try {
    const userId = req.user._id
    console.log("Getting messages for user:", userId)

    const messages = await messageModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 })

    console.log(`Found ${messages.length} messages for user`)
    res.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error("Error getting user messages:", error)
    res.json({
      success: false,
      message: "Error getting messages",
    })
  }
}

// Get all messages (admin/staff only)
const getAllMessages = async (req, res) => {
  try {
    console.log("Getting all messages for admin/staff")

    const messages = await messageModel
      .find({})
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 })

    console.log(`Found ${messages.length} total messages`)
    res.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error("Error getting all messages:", error)
    res.json({
      success: false,
      message: "Error getting messages",
    })
  }
}

// Get conversation between two users
const getUserConversation = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id

    console.log("Getting conversation between:", currentUserId, "and", userId)

    const messages = await messageModel
      .find({
        $or: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      })
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: 1 })

    console.log(`Found ${messages.length} messages in conversation`)
    res.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error("Error getting conversation:", error)
    res.json({
      success: false,
      message: "Error getting conversation",
    })
  }
}

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    console.log("Marking message as read:", id, "by user:", userId)

    const message = await messageModel.findById(id)
    if (!message) {
      return res.json({
        success: false,
        message: "Message not found",
      })
    }

    // Only receiver can mark message as read
    if (message.receiverId.toString() !== userId.toString()) {
      return res.json({
        success: false,
        message: "Not authorized to mark this message as read",
      })
    }

    const updatedMessage = await messageModel.findByIdAndUpdate(id, { isRead: true }, { new: true })

    console.log("Message marked as read successfully:", id)
    res.json({
      success: true,
      message: "Message marked as read",
      messageData: updatedMessage,
    })
  } catch (error) {
    console.error("Error marking message as read:", error)
    res.json({
      success: false,
      message: "Error marking message as read",
    })
  }
}

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    console.log("Deleting message:", id, "by user:", userId)

    const message = await messageModel.findById(id)
    if (!message) {
      return res.json({
        success: false,
        message: "Message not found",
      })
    }

    // Only sender or admin/staff can delete message
    if (message.senderId.toString() !== userId.toString() && req.user.role !== "admin" && req.user.role !== "staff") {
      return res.json({
        success: false,
        message: "Not authorized to delete this message",
      })
    }

    await messageModel.findByIdAndDelete(id)

    console.log("Message deleted successfully:", id)
    res.json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting message:", error)
    res.json({
      success: false,
      message: "Error deleting message",
    })
  }
}

export { sendMessage, getUserMessages, getAllMessages, getUserConversation, markAsRead, deleteMessage }
