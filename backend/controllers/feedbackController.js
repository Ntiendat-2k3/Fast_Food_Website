import feedbackModel from "../models/feedbackModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"

// Create a new feedback
const createFeedback = async (req, res) => {
  try {
    const { message } = req.body
    const userId = req.user._id

    // Validate message
    if (!message) {
      return res.json({ success: false, message: "Nội dung phản hồi không được để trống" })
    }

    // Get user details
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy thông tin người dùng" })
    }

    // Create new feedback
    const newFeedback = new feedbackModel({
      userId,
      userName: user.name,
      message,
    })

    const savedFeedback = await newFeedback.save()

    res.json({
      success: true,
      message: "Gửi phản hồi thành công",
      feedback: savedFeedback,
    })
  } catch (error) {
    console.error("Error creating feedback:", error)
    res.json({ success: false, message: "Lỗi khi gửi phản hồi" })
  }
}

// Get all feedback (for admin)
const getAllFeedback = async (req, res) => {
  try {
    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    const feedback = await feedbackModel.find({}).sort({ createdAt: -1 })

    res.json({ success: true, data: feedback })
  } catch (error) {
    console.error("Error getting all feedback:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách phản hồi" })
  }
}

// Get feedback for a specific user
const getUserFeedback = async (req, res) => {
  try {
    const userId = req.user._id

    const feedback = await feedbackModel.find({ userId }).sort({ createdAt: -1 })

    res.json({ success: true, data: feedback })
  } catch (error) {
    console.error("Error getting user feedback:", error)
    res.json({ success: false, message: "Lỗi khi lấy phản hồi" })
  }
}

// Reply to feedback
const replyToFeedback = async (req, res) => {
  try {
    const { id, message } = req.body

    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID phản hồi không hợp lệ" })
    }

    if (!message) {
      return res.json({ success: false, message: "Nội dung phản hồi không được để trống" })
    }

    const updatedFeedback = await feedbackModel.findByIdAndUpdate(
      id,
      {
        status: "replied",
        reply: {
          message,
          createdAt: new Date(),
        },
      },
      { new: true },
    )

    if (!updatedFeedback) {
      return res.json({ success: false, message: "Không tìm thấy phản hồi" })
    }

    res.json({ success: true, message: "Phản hồi thành công", feedback: updatedFeedback })
  } catch (error) {
    console.error("Error replying to feedback:", error)
    res.json({ success: false, message: "Lỗi khi phản hồi" })
  }
}

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.body

    // Check if the requesting user is an admin
    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admin privileges required." })
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID phản hồi không hợp lệ" })
    }

    const deletedFeedback = await feedbackModel.findByIdAndDelete(id)

    if (!deletedFeedback) {
      return res.json({ success: false, message: "Không tìm thấy phản hồi" })
    }

    res.json({ success: true, message: "Xóa phản hồi thành công" })
  } catch (error) {
    console.error("Error deleting feedback:", error)
    res.json({ success: false, message: "Lỗi khi xóa phản hồi" })
  }
}

export { createFeedback, getAllFeedback, getUserFeedback, replyToFeedback, deleteFeedback }
