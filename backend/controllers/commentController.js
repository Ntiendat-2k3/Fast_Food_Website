import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import orderModel from "../models/orderModel.js"
import foodModel from "../models/foodModel.js"

// Kiểm tra xem user đã mua sản phẩm này chưa
const checkUserPurchase = async (userId, foodId) => {
  try {
    console.log("Checking purchase for userId:", userId, "foodId:", foodId)

    const food = await foodModel.findById(foodId)
    if (!food) {
      console.log("Food not found")
      return false
    }
    console.log("Food found:", food.name)

    const allOrders = await orderModel.find({ userId: userId })
    console.log("Total orders found:", allOrders.length)

    if (allOrders.length === 0) {
      console.log("No orders found for user")
      return false
    }

    // Kiểm tra tất cả đơn hàng, không chỉ đơn hàng đã thanh toán
    const validOrders = allOrders.filter((order) => {
      console.log("Checking order:", {
        orderId: order._id,
        payment: order.payment,
        paymentStatus: order.paymentStatus,
        status: order.status,
      })

      // Chấp nhận đơn hàng đã thanh toán hoặc đang xử lý
      const isPaid =
        order.payment === true ||
        order.paymentStatus === "Đã thanh toán" ||
        order.paymentStatus === "paid" ||
        order.status === "Đã giao" ||
        order.status === "Delivered" ||
        order.status === "Đang giao" ||
        order.status === "Shipping" ||
        order.status === "Đang chuẩn bị" ||
        order.status === "Processing"

      const validStatus = order.status && !["Hủy", "Cancelled", "Canceled"].includes(order.status)

      console.log("Order validation:", { isPaid, validStatus })
      return isPaid && validStatus
    })

    console.log("Valid orders count:", validOrders.length)

    if (validOrders.length === 0) {
      console.log("No valid orders found")
      return false
    }

    for (let i = 0; i < validOrders.length; i++) {
      const order = validOrders[i]
      console.log("Checking order items for order:", order._id)

      if (!order.items || order.items.length === 0) {
        console.log("Order has no items")
        continue
      }

      for (let j = 0; j < order.items.length; j++) {
        const item = order.items[j]
        console.log("Checking item:", item)

        let isMatch = false

        // Kiểm tra theo foodId
        if (item.foodId) {
          const itemFoodId = item.foodId.toString()
          const targetFoodId = foodId.toString()
          console.log("Comparing foodIds:", itemFoodId, "vs", targetFoodId)
          if (itemFoodId === targetFoodId) {
            isMatch = true
            console.log("Match found by foodId")
          }
        }

        // Kiểm tra theo tên sản phẩm
        if (!isMatch && item.name && food.name) {
          const itemName = item.name.toLowerCase().trim()
          const foodName = food.name.toLowerCase().trim()
          console.log("Comparing names:", itemName, "vs", foodName)
          if (itemName === foodName) {
            isMatch = true
            console.log("Match found by name")
          }
        }

        // Kiểm tra theo _id
        if (!isMatch && item._id) {
          const itemId = item._id.toString()
          const targetFoodId = foodId.toString()
          console.log("Comparing _ids:", itemId, "vs", targetFoodId)
          if (itemId === targetFoodId) {
            isMatch = true
            console.log("Match found by _id")
          }
        }

        // Kiểm tra theo id field
        if (!isMatch && item.id) {
          const itemIdField = item.id.toString()
          const targetFoodId = foodId.toString()
          console.log("Comparing id fields:", itemIdField, "vs", targetFoodId)
          if (itemIdField === targetFoodId) {
            isMatch = true
            console.log("Match found by id field")
          }
        }

        if (isMatch) {
          console.log("Purchase confirmed!")
          return true
        }
      }
    }

    console.log("No matching items found in any order")
    return false
  } catch (error) {
    console.error("Error checking user purchase:", error)
    return false
  }
}

// Thêm rating hoặc comment mới
const addComment = async (req, res) => {
  try {
    const { userId, foodId, rating, comment, type = "rating" } = req.body

    console.log("Adding comment/rating:", { userId, foodId, type, hasRating: !!rating, hasComment: !!comment })

    if (!userId || !foodId) {
      return res.json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: "ID người dùng không hợp lệ" })
    }

    // Validate based on type
    if (type === "rating") {
      if (!rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" })
      }
    } else if (type === "comment") {
      if (!comment || comment.trim() === "") {
        return res.json({ success: false, message: "Nội dung bình luận không được để trống" })
      }
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Check if user already has this type of entry for this food
    const existingEntry = await commentModel.findOne({
      userId,
      foodId,
      type: type,
    })

    console.log("Existing entry check:", { existingEntry: !!existingEntry, type })

    if (existingEntry) {
      return res.json({
        success: false,
        message: type === "rating" ? "Bạn đã đánh giá sản phẩm này rồi." : "Bạn đã bình luận về sản phẩm này rồi.",
      })
    }

    // Check if user has purchased the product (only for ratings)
    if (type === "rating") {
      const hasPurchased = await checkUserPurchase(userId, foodId)
      console.log("Purchase check result:", hasPurchased)

      if (!hasPurchased) {
        return res.json({
          success: false,
          message: "Bạn cần mua và nhận được sản phẩm này trước khi có thể đánh giá",
        })
      }
    }

    const newComment = new commentModel({
      userId,
      foodId,
      rating: type === "rating" ? Number(rating) : undefined,
      comment: comment || (type === "rating" ? "Đánh giá sao" : ""),
      userName: user.name,
      isApproved: true,
      type: type,
    })

    console.log("Creating new comment:", { type, rating: newComment.rating, comment: newComment.comment })

    const savedComment = await newComment.save()

    console.log("Comment saved successfully:", savedComment._id)

    res.json({
      success: true,
      message: type === "rating" ? "Đánh giá thành công" : "Bình luận thành công",
      data: {
        _id: savedComment._id,
        userId: savedComment.userId,
        userName: user.name,
        foodId: savedComment.foodId,
        rating: savedComment.rating,
        comment: savedComment.comment,
        type: savedComment.type,
        createdAt: savedComment.createdAt,
      },
    })
  } catch (error) {
    console.error("Error adding comment/rating:", error)

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      const type = req.body.type || "rating"
      return res.json({
        success: false,
        message: type === "rating" ? "Bạn đã đánh giá sản phẩm này rồi." : "Bạn đã bình luận về sản phẩm này rồi.",
      })
    }

    res.json({
      success: false,
      message: "Lỗi khi thêm: " + error.message,
    })
  }
}

// Lấy danh sách đánh giá theo sản phẩm
const getCommentsByFood = async (req, res) => {
  try {
    const { foodId } = req.params

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    const comments = await commentModel
      .find({ foodId, isApproved: true })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })

    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      userId: comment.userId?._id || comment.userId,
      userName: comment.userId?.name || comment.userName,
      userEmail: comment.userId?.email,
      rating: comment.rating,
      comment: comment.comment,
      type: comment.type || "rating", // Default to rating for backward compatibility
      createdAt: comment.createdAt,
      adminReply: comment.adminReply,
      adminReplyAt: comment.adminReplyAt,
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

    // Chỉ lấy những comment có rating (type = 'rating')
    const ratingComments = await commentModel.find({
      foodId,
      isApproved: true,
      $or: [
        { type: "rating" },
        { type: { $exists: false }, rating: { $exists: true, $ne: null } }, // Backward compatibility
      ],
    })

    if (ratingComments.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      })
    }

    const validRatings = ratingComments.filter(
      (comment) => comment.rating && comment.rating >= 1 && comment.rating <= 5,
    )

    if (validRatings.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      })
    }

    const totalRating = validRatings.reduce((sum, comment) => sum + comment.rating, 0)
    const averageRating = totalRating / validRatings.length

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    validRatings.forEach((comment) => {
      if (comment.rating) {
        ratingDistribution[comment.rating]++
      }
    })

    res.json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: validRatings.length,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error("Error getting rating stats:", error)
    res.json({ success: false, message: "Lỗi khi lấy thống kê đánh giá" })
  }
}

// Get rating stats for multiple foods (batch request)
const getBatchRatings = async (req, res) => {
  try {
    const { foodIds } = req.body

    if (!foodIds || !Array.isArray(foodIds)) {
      return res.json({ success: false, message: "foodIds array is required" })
    }

    const ratings = []

    for (const foodId of foodIds) {
      if (!mongoose.Types.ObjectId.isValid(foodId)) {
        continue
      }

      // Chỉ lấy những comment có rating
      const ratingComments = await commentModel.find({
        foodId,
        isApproved: true,
        $or: [
          { type: "rating" },
          { type: { $exists: false }, rating: { $exists: true, $ne: null } }, // Backward compatibility
        ],
      })

      if (ratingComments.length === 0) {
        ratings.push({
          foodId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
        continue
      }

      const validRatings = ratingComments.filter(
        (comment) => comment.rating && comment.rating >= 1 && comment.rating <= 5,
      )

      if (validRatings.length === 0) {
        ratings.push({
          foodId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
        continue
      }

      const totalRating = validRatings.reduce((sum, comment) => sum + comment.rating, 0)
      const averageRating = totalRating / validRatings.length

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      validRatings.forEach((comment) => {
        if (comment.rating) {
          ratingDistribution[comment.rating]++
        }
      })

      ratings.push({
        foodId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: validRatings.length,
        ratingDistribution,
      })
    }

    res.json({
      success: true,
      ratings,
    })
  } catch (error) {
    console.error("Error getting batch ratings:", error)
    res.json({ success: false, message: "Lỗi khi lấy thống kê đánh giá" })
  }
}

// Kiểm tra xem user có thể đánh giá/bình luận sản phẩm không
const checkCanReview = async (req, res) => {
  try {
    const { userId, foodId } = req.params

    console.log("Checking review eligibility for userId:", userId, "foodId:", foodId)

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

    // Check existing rating and comment separately
    const existingRating = await commentModel.findOne({
      userId,
      foodId,
      $or: [
        { type: "rating" },
        { type: { $exists: false }, rating: { $exists: true, $ne: null } }, // Backward compatibility
      ],
    })

    const existingComment = await commentModel.findOne({
      userId,
      foodId,
      type: "comment",
    })

    console.log("Existing entries:", {
      hasRating: !!existingRating,
      hasComment: !!existingComment,
    })

    const hasPurchased = await checkUserPurchase(userId, foodId)
    console.log("Purchase check result:", hasPurchased)

    const result = {
      canReview: hasPurchased && !existingRating,
      canComment: !existingComment, // Anyone can comment once
      hasPurchased,
      hasReviewed: !!existingRating,
      hasCommented: !!existingComment,
      existingReview: existingRating
        ? {
            rating: existingRating.rating,
            comment: existingRating.comment,
            createdAt: existingRating.createdAt,
          }
        : null,
      existingComment: existingComment
        ? {
            comment: existingComment.comment,
            createdAt: existingComment.createdAt,
          }
        : null,
    }

    console.log("Review eligibility result:", result)

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
      type: comment.type || "rating", // Default to rating for backward compatibility
      isApproved: comment.isApproved,
      createdAt: comment.createdAt,
      adminReply: comment.adminReply
        ? {
            message: comment.adminReply,
            createdAt: comment.adminReplyAt,
          }
        : null,
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

// Admin: Duyệt/hủy duyệt đánh giá
const toggleApproveComment = async (req, res) => {
  try {
    const { id, isApproved } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const comment = await commentModel.findByIdAndUpdate(id, { isApproved }, { new: true })

    if (!comment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({
      success: true,
      message: isApproved ? "Đã duyệt đánh giá" : "Đã hủy duyệt đánh giá",
      data: comment,
    })
  } catch (error) {
    console.error("Error toggling comment approval:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật trạng thái đánh giá" })
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

// Admin: Phản hồi đánh giá
const replyToComment = async (req, res) => {
  try {
    const { id, message } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    if (!message || message.trim() === "") {
      return res.json({ success: false, message: "Nội dung phản hồi không được để trống" })
    }

    const comment = await commentModel.findByIdAndUpdate(
      id,
      {
        adminReply: message.trim(),
        adminReplyAt: new Date(),
      },
      { new: true },
    )

    if (!comment) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({
      success: true,
      message: "Đã phản hồi đánh giá thành công",
      data: comment,
    })
  } catch (error) {
    console.error("Error replying to comment:", error)
    res.json({ success: false, message: "Lỗi khi phản hồi đánh giá" })
  }
}

// Debug function - Lấy thông tin đơn hàng của user
const debugUserOrders = async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: "ID người dùng không hợp lệ" })
    }

    const orders = await orderModel.find({ userId }).populate("items.foodId")

    const debugInfo = orders.map((order) => ({
      orderId: order._id,
      status: order.status,
      payment: order.payment,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.name,
        foodId: item.foodId,
        _id: item._id,
        id: item.id,
      })),
    }))

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        orders: debugInfo,
      },
    })
  } catch (error) {
    console.error("Error getting debug info:", error)
    res.json({ success: false, message: "Lỗi khi lấy thông tin debug" })
  }
}

export {
  addComment,
  getCommentsByFood,
  getFoodRatingStats,
  getBatchRatings,
  checkCanReview,
  getAllComments,
  toggleApproveComment,
  deleteComment,
  replyToComment,
  debugUserOrders,
}
