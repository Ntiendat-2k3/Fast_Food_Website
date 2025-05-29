import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"

// Thêm bình luận mới
const addComment = async (req, res) => {
  try {
    const { userId, foodId, rating, comment } = req.body

    console.log("Adding comment:", { userId, foodId, rating, comment })

    // Validate required fields
    if (!userId || !foodId || !rating || !comment) {
      return res.json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      })
    }

    // Validate foodId
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      console.log("Invalid foodId:", foodId)
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid userId:", userId)
      return res.json({ success: false, message: "ID người dùng không hợp lệ" })
    }

    // Lấy thông tin người dùng
    const user = await userModel.findById(userId)
    if (!user) {
      console.log("User not found with ID:", userId)
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Tạo comment mới
    const newComment = new commentModel({
      userId,
      foodId,
      rating: Number(rating),
      comment: comment.trim(),
      userName: user.name,
      isApproved: true,
    })

    const savedComment = await newComment.save()
    console.log("Comment saved successfully:", savedComment._id)

    // Tự động phản hồi
    const autoResponse = {
      adminReply: {
        message: `Cảm ơn bạn ${user.name} đã đánh giá! Chúng tôi rất vui khi bạn hài lòng với dịch vụ và mong bạn sẽ quay lại ủng hộ chúng tôi.`,
        createdAt: new Date(),
      },
    }

    await commentModel.findByIdAndUpdate(savedComment._id, autoResponse)

    res.json({
      success: true,
      message: "Thêm đánh giá thành công",
      data: {
        _id: savedComment._id,
        userId: savedComment.userId,
        userName: user.name,
        foodId: savedComment.foodId,
        rating: savedComment.rating,
        comment: savedComment.comment,
        createdAt: savedComment.createdAt,
        adminReply: autoResponse.adminReply,
      },
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.json({
      success: false,
      message: "Lỗi khi thêm đánh giá: " + error.message,
    })
  }
}

// Cập nhật bình luận
const updateComment = async (req, res) => {
  try {
    const { commentId, rating, comment, userId } = req.body

    console.log("Updating comment:", { commentId, rating, comment, userId })

    // Validate required fields
    if (!commentId || !rating || !comment || !userId) {
      return res.json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      })
    }

    // Validate commentId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: "ID người dùng không hợp lệ" })
    }

    // Tìm comment
    const existingComment = await commentModel.findById(commentId)
    if (!existingComment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    // Kiểm tra quyền sở hữu
    if (existingComment.userId.toString() !== userId) {
      return res.json({ success: false, message: "Bạn chỉ có thể sửa đánh giá của chính mình" })
    }

    // Cập nhật comment
    const updatedComment = await commentModel.findByIdAndUpdate(
      commentId,
      {
        rating: Number(rating),
        comment: comment.trim(),
        updatedAt: new Date(),
      },
      { new: true },
    )

    console.log("Comment updated successfully:", updatedComment._id)

    res.json({
      success: true,
      message: "Cập nhật đánh giá thành công",
      data: {
        _id: updatedComment._id,
        userId: updatedComment.userId,
        userName: updatedComment.userName,
        foodId: updatedComment.foodId,
        rating: updatedComment.rating,
        comment: updatedComment.comment,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        adminReply: updatedComment.adminReply,
      },
    })
  } catch (error) {
    console.error("Error updating comment:", error)
    res.json({
      success: false,
      message: "Lỗi khi cập nhật đánh giá: " + error.message,
    })
  }
}

// Lấy danh sách bình luận theo sản phẩm
const getCommentsByFood = async (req, res) => {
  try {
    const { foodId } = req.params
    console.log("Getting comments for food:", foodId)

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    const comments = await commentModel.find({ foodId, isApproved: true }).sort({ createdAt: -1 })

    console.log(`Found ${comments.length} comments for food ${foodId}`)
    res.json({ success: true, data: comments })
  } catch (error) {
    console.error("Error getting comments:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đánh giá" })
  }
}

// Lấy tất cả bình luận (cho admin)
const getAllComments = async (req, res) => {
  try {
    const comments = await commentModel.find({}).sort({ createdAt: -1 })
    res.json({ success: true, data: comments })
  } catch (error) {
    console.error("Error getting all comments:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đánh giá" })
  }
}

// Phản hồi bình luận
const replyToComment = async (req, res) => {
  try {
    const { id, message } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const updatedComment = await commentModel.findByIdAndUpdate(
      id,
      {
        adminReply: {
          message,
          createdAt: new Date(),
        },
      },
      { new: true },
    )

    if (!updatedComment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({ success: true, message: "Thêm phản hồi thành công" })
  } catch (error) {
    console.error("Error replying to comment:", error)
    res.json({ success: false, message: "Lỗi khi thêm phản hồi" })
  }
}

// Xóa bình luận
const deleteComment = async (req, res) => {
  try {
    const { id } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const deletedComment = await commentModel.findByIdAndDelete(id)

    if (!deletedComment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({ success: true, message: "Xóa đánh giá thành công" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    res.json({ success: false, message: "Lỗi khi xóa đánh giá" })
  }
}

// Lấy thống kê rating của sản phẩm
const getFoodRatingStats = async (req, res) => {
  try {
    const { foodId } = req.params

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    const comments = await commentModel.find({ foodId, isApproved: true })

    if (comments.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      })
    }

    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0)
    const averageRating = totalRating / comments.length

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    comments.forEach((comment) => {
      ratingDistribution[comment.rating]++
    })

    res.json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: comments.length,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error("Error getting rating stats:", error)
    res.json({ success: false, message: "Lỗi khi lấy thống kê đánh giá" })
  }
}

// Cập nhật trạng thái bình luận
const updateCommentStatus = async (req, res) => {
  try {
    const { id, isApproved } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const updatedComment = await commentModel.findByIdAndUpdate(id, { isApproved }, { new: true })

    if (!updatedComment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({ success: true, message: "Cập nhật trạng thái đánh giá thành công" })
  } catch (error) {
    console.error("Error updating comment status:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật trạng thái đánh giá" })
  }
}

export {
  addComment,
  updateComment,
  getCommentsByFood,
  getAllComments,
  updateCommentStatus,
  deleteComment,
  replyToComment,
  getFoodRatingStats,
}
