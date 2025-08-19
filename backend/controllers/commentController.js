import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import orderModel from "../models/orderModel.js"
import foodModel from "../models/foodModel.js"

// Kiểm tra xem user đã mua sản phẩm này chưa
const checkUserPurchase = async (userId, foodId) => {
  try {
    // console.log("Checking purchase for userId:", userId, "foodId:", foodId)

    const food = await foodModel.findById(foodId)
    if (!food) {
      // console.log("Food not found")
      return false
    }

    const allOrders = await orderModel.find({ userId: userId })
    // console.log("Total orders found:", allOrders.length)

    if (allOrders.length === 0) {
      return false
    }

    // Kiểm tra đơn hàng đã hoàn thành - sửa lại logic này
    const validOrders = allOrders.filter((order) => {
      // Kiểm tra trạng thái đơn hàng đã giao hoặc hoàn thành
      const isDelivered = ["Đã giao", "Đã giao hàng", "Delivered", "Đã hoàn thành"].includes(order.status)

      // Kiểm tra thanh toán (COD có thể chưa thanh toán nhưng đã giao)
      const isValidPayment = order.paymentMethod === "COD" ||
                           order.payment === true ||
                           order.paymentStatus === "Đã thanh toán" ||
                           order.paymentStatus === "paid"

      // Đơn hàng không bị hủy
      const notCancelled = !["Hủy", "Cancelled", "Canceled", "Đã hủy"].includes(order.status)

      // console.log(`Order ${order._id}: status=${order.status}, payment=${order.paymentStatus}, method=${order.paymentMethod}`)
      // console.log(`Checks: delivered=${isDelivered}, validPayment=${isValidPayment}, notCancelled=${notCancelled}`)

      return isDelivered && isValidPayment && notCancelled
    })

    // console.log(`Valid orders found: ${validOrders.length}`)

    if (validOrders.length === 0) {
      return false
    }

    // Kiểm tra xem có sản phẩm này trong đơn hàng không
    for (const order of validOrders) {
      if (!order.items || order.items.length === 0) continue

      for (const item of order.items) {
        // Kiểm tra theo foodId
        if (item.foodId && item.foodId.toString() === foodId.toString()) {
          // console.log(`Found product by foodId in order ${order._id}`)
          return true
        }
        // Kiểm tra theo tên sản phẩm (fallback)
        if (item.name && food.name && item.name.toLowerCase().trim() === food.name.toLowerCase().trim()) {
          // console.log(`Found product by name in order ${order._id}`)
          return true
        }
      }
    }

    // console.log("Product not found in any valid order")
    return false
  } catch (error) {
    console.error("Error checking user purchase:", error)
    return false
  }
}

// Thêm comment mới
const addComment = async (req, res) => {
  try {
    const { userId, foodId, rating, comment } = req.body

    // console.log("Adding comment:", { userId, foodId, rating, comment })

    if (!userId || !foodId || !rating || !comment) {
      return res.json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(foodId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: "ID không hợp lệ" })
    }

    if (rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" })
    }

    if (comment.trim().length < 10) {
      return res.json({ success: false, message: "Nội dung đánh giá phải có ít nhất 10 ký tự" })
    }

    if (comment.trim().length > 500) {
      return res.json({ success: false, message: "Nội dung đánh giá không được vượt quá 500 ký tự" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Kiểm tra đã comment chưa
    const existingComment = await commentModel.findOne({ userId, foodId })
    if (existingComment) {
      return res.json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi.",
      })
    }

    // Kiểm tra đã mua hàng chưa
    const hasPurchased = await checkUserPurchase(userId, foodId)
    if (!hasPurchased) {
      return res.json({
        success: false,
        message: "Bạn cần mua và nhận được sản phẩm này trước khi có thể đánh giá",
      })
    }

    const newComment = new commentModel({
      userId,
      foodId,
      rating: Number(rating),
      comment: comment.trim(),
      userName: user.name,
    })

    const savedComment = await newComment.save()

    res.json({
      success: true,
      message: "Đánh giá thành công",
      data: {
        _id: savedComment._id,
        userId: savedComment.userId,
        userName: user.name,
        foodId: savedComment.foodId,
        rating: savedComment.rating,
        comment: savedComment.comment,
        createdAt: savedComment.createdAt,
      },
    })
  } catch (error) {
    console.error("Error adding comment:", error)

    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi.",
      })
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0]
      return res.json({
        success: false,
        message: firstError.message,
      })
    }

    res.json({
      success: false,
      message: "Lỗi khi thêm đánh giá: " + error.message,
    })
  }
}

// Lấy danh sách đánh giá theo sản phẩm
const getCommentsByFood = async (req, res) => {
  try {
    const { foodId } = req.params

    // console.log("Getting comments for foodId:", foodId)

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    const comments = await commentModel.find({ foodId }).populate("userId", "name email").sort({ createdAt: -1 })

    // console.log("Found comments:", comments.length)

    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      userId: comment.userId?._id || comment.userId,
      userName: comment.userId?.name || comment.userName,
      userEmail: comment.userId?.email,
      rating: comment.rating,
      comment: comment.comment,
      adminReply: comment.adminReply,
      adminReplyAt: comment.adminReplyAt,
      adminReplyBy: comment.adminReplyBy,
      createdAt: comment.createdAt,
    }))

    res.json({ success: true, data: formattedComments })
  } catch (error) {
    console.error("Error getting comments:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đánh giá" })
  }
}

// Lấy thống kê rating của sản phẩm
const getFoodRatingStats = async (req, res) => {
  try {
    const { foodId } = req.params

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    const comments = await commentModel.find({ foodId })

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

// Kiểm tra xem user có thể đánh giá sản phẩm không
const checkCanReview = async (req, res) => {
  try {
    const { userId, foodId } = req.params

    // console.log("Checking review eligibility for userId:", userId, "foodId:", foodId)

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID không hợp lệ" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    const food = await foodModel.findById(foodId)
    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
    }

    // Kiểm tra đã comment chưa
    const existingComment = await commentModel.findOne({ userId, foodId })

    const hasPurchased = await checkUserPurchase(userId, foodId)

    const result = {
      canReview: hasPurchased && !existingComment,
      hasPurchased,
      hasReviewed: !!existingComment,
      existingReview: existingComment
        ? {
            _id: existingComment._id,
            rating: existingComment.rating,
            comment: existingComment.comment,
            createdAt: existingComment.createdAt,
          }
        : null,
    }

    // console.log("Review eligibility result:", result)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error checking review eligibility:", error)
    res.json({ success: false, message: "Lỗi khi kiểm tra quyền đánh giá" })
  }
}

// Admin: Lấy tất cả đánh giá
const getAllComments = async (req, res) => {
  try {
    const comments = await commentModel
      .find({})
      .populate("userId", "name email")
      .populate("foodId", "name image category")
      .sort({ createdAt: -1 })

    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      userId: comment.userId?._id || comment.userId,
      userName: comment.userId?.name || comment.userName,
      userEmail: comment.userId?.email,
      foodId: comment.foodId?._id || comment.foodId,
      foodName: comment.foodId?.name,
      foodImage: comment.foodId?.image,
      foodCategory: comment.foodId?.category,
      rating: comment.rating,
      comment: comment.comment,
      adminReply: comment.adminReply,
      adminReplyAt: comment.adminReplyAt,
      adminReplyBy: comment.adminReplyBy,
      createdAt: comment.createdAt,
    }))

    res.json({
      success: true,
      data: formattedComments,
    })
  } catch (error) {
    console.error("Error getting all comments:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đánh giá" })
  }
}

// Admin: Xóa đánh giá
const deleteComment = async (req, res) => {
  try {
    const { id } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const comment = await commentModel.findByIdAndDelete(id)

    if (!comment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({
      success: true,
      message: "Đã xóa đánh giá thành công",
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    res.json({ success: false, message: "Lỗi khi xóa đánh giá" })
  }
}

// Admin: Reply đánh giá
const replyComment = async (req, res) => {
  try {
    const { commentId, adminReply, adminName } = req.body

    // console.log("Admin replying to comment:", { commentId, adminReply, adminName })

    if (!commentId || !adminReply || !adminName) {
      return res.json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    if (adminReply.trim().length < 5) {
      return res.json({ success: false, message: "Phản hồi phải có ít nhất 5 ký tự" })
    }

    if (adminReply.trim().length > 500) {
      return res.json({ success: false, message: "Phản hồi không được vượt quá 500 ký tự" })
    }

    const comment = await commentModel.findById(commentId)
    if (!comment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    // Cập nhật reply
    comment.adminReply = adminReply.trim()
    comment.adminReplyAt = new Date()
    comment.adminReplyBy = adminName

    const updatedComment = await comment.save()

    res.json({
      success: true,
      message: "Phản hồi thành công",
      data: {
        _id: updatedComment._id,
        adminReply: updatedComment.adminReply,
        adminReplyAt: updatedComment.adminReplyAt,
        adminReplyBy: updatedComment.adminReplyBy,
      },
    })
  } catch (error) {
    console.error("Error replying to comment:", error)
    res.json({
      success: false,
      message: "Lỗi khi phản hồi đánh giá: " + error.message,
    })
  }
}

const updateReply = async (req, res) => {
  try {
    const { commentId } = req.params
    const { adminReply, adminName } = req.body

    console.log("Admin updating reply:", { commentId, adminReply, adminName })

    // Validate required fields
    if (!adminReply || !adminName) {
      return res.json({ success: false, message: "Vui lòng điền đầy đủ thông tin" })
    }

    // Validate reply length
    if (adminReply.trim().length < 5 || adminReply.trim().length > 500) {
      return res.json({ success: false, message: "Phản hồi phải từ 5 đến 500 ký tự" })
    }

    const comment = await commentModel.findById(commentId)
    if (!comment) {
      return res.json({ success: false, message: "Bình luận không tồn tại" })
    }

    // Update admin reply
    comment.adminReply = adminReply.trim()
    comment.adminReplyAt = new Date()
    comment.adminReplyBy = adminName

    await comment.save()

    res.json({
      success: true,
      message: "Cập nhật phản hồi thành công",
      data: {
        adminReply: comment.adminReply,
        adminReplyAt: comment.adminReplyAt,
        adminReplyBy: comment.adminReplyBy
      }
    })
  } catch (error) {
    console.error("Error updating reply:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật phản hồi: " + error.message })
  }
}

// Admin: Xóa reply
const deleteReply = async (req, res) => {
  try {
    const { commentId } = req.body

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const comment = await commentModel.findById(commentId)
    if (!comment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    // Xóa reply
    comment.adminReply = undefined
    comment.adminReplyAt = undefined
    comment.adminReplyBy = undefined

    await comment.save()

    res.json({
      success: true,
      message: "Đã xóa phản hồi thành công",
    })
  } catch (error) {
    console.error("Error deleting reply:", error)
    res.json({ success: false, message: "Lỗi khi xóa phản hồi" })
  }
}

// User: Update own comment
const updateComment = async (req, res) => {
  try {
    const { commentId, userId, rating, comment } = req.body

    // console.log("User updating comment:", { commentId, userId, rating, comment })

    if (!commentId || !userId || !rating || !comment) {
      return res.json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: "ID không hợp lệ" })
    }

    if (rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" })
    }

    if (comment.trim().length < 10) {
      return res.json({ success: false, message: "Nội dung đánh giá phải có ít nhất 10 ký tự" })
    }

    if (comment.trim().length > 500) {
      return res.json({ success: false, message: "Nội dung đánh giá không được vượt quá 500 ký tự" })
    }

    const existingComment = await commentModel.findById(commentId)
    if (!existingComment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    // Check if user owns this comment
    if (existingComment.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Bạn không có quyền chỉnh sửa đánh giá này" })
    }

    // Update comment
    existingComment.rating = Number(rating)
    existingComment.comment = comment.trim()
    existingComment.updatedAt = new Date()

    const updatedComment = await existingComment.save()

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
        adminReplyAt: updatedComment.adminReplyAt,
        adminReplyBy: updatedComment.adminReplyBy,
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

export {
  addComment,
  getCommentsByFood,
  getFoodRatingStats,
  checkCanReview,
  getAllComments,
  deleteComment,
  replyComment,
  updateReply,
  deleteReply,
  updateComment
}
