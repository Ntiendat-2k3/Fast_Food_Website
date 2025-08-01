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

// Thêm rating mới
const addComment = async (req, res) => {
  try {
    const { userId, foodId, rating, comment } = req.body

    console.log("Adding rating:", { userId, foodId, rating, hasComment: !!comment })

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

    if (!rating || rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" })
    }

    if (!comment || comment.trim().length < 10) {
      return res.json({ success: false, message: "Nội dung đánh giá phải có ít nhất 10 ký tự" })
    }

    if (comment.trim().length > 500) {
      return res.json({ success: false, message: "Nội dung đánh giá không được vượt quá 500 ký tự" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Check if user already has rating for this food
    const existingRating = await commentModel.findOne({
      userId,
      foodId,
    })

    console.log("Existing rating check:", { existingRating: !!existingRating })

    if (existingRating) {
      return res.json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi.",
      })
    }

    // Kiểm tra xem user có mua sản phẩm này chưa
    const hasPurchased = await checkUserPurchase(userId, foodId)
    console.log("Purchase check result:", hasPurchased)

    if (!hasPurchased) {
      return res.json({
        success: false,
        message: "Bạn cần mua và nhận được sản phẩm này trước khi có thể đánh giá",
      })
    }

    const newRating = new commentModel({
      userId,
      foodId,
      rating: Number(rating),
      comment: comment.trim(),
      userName: user.name,
      isApproved: true,
    })

    console.log("Creating new rating:", { rating: newRating.rating, comment: newRating.comment })

    const savedRating = await newRating.save()

    console.log("Rating saved successfully:", savedRating._id)

    res.json({
      success: true,
      message: "Đánh giá thành công",
      data: {
        _id: savedRating._id,
        userId: savedRating.userId,
        userName: user.name,
        foodId: savedRating.foodId,
        rating: savedRating.rating,
        comment: savedRating.comment,
        createdAt: savedRating.createdAt,
      },
    })
  } catch (error) {
    console.error("Error adding rating:", error)

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi.",
      })
    }

    // Handle validation errors
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

    console.log("=== BACKEND: Getting comments for foodId:", foodId)

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      console.log("Invalid foodId format")
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    // Kiểm tra xem food có tồn tại không
    const food = await foodModel.findById(foodId)
    if (!food) {
      console.log("Food not found in database")
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
    }
    console.log("Food found:", food.name)

    // Lấy tất cả comments cho foodId này
    const allComments = await commentModel.find({ foodId })
    console.log("Total comments found (all):", allComments.length)

    // Lấy chỉ comments đã được approve
    const ratings = await commentModel
      .find({ foodId, isApproved: true })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })

    console.log("Approved comments found:", ratings.length)
    console.log("Sample comment data:", ratings.length > 0 ? ratings[0] : "No comments")

    const formattedRatings = ratings.map((rating) => ({
      _id: rating._id,
      userId: rating.userId?._id || rating.userId,
      userName: rating.userId?.name || rating.userName,
      userEmail: rating.userId?.email,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      adminReply: rating.adminReply,
      adminReplyAt: rating.adminReplyAt,
    }))

    console.log("Formatted ratings:", formattedRatings.length)

    res.json({ success: true, data: formattedRatings })
  } catch (error) {
    console.error("Error getting ratings:", error)
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

    const ratings = await commentModel.find({
      foodId,
      isApproved: true,
      rating: { $exists: true, $ne: null },
    })

    if (ratings.length === 0) {
      return res.json({
        success: true,
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      })
    }

    const validRatings = ratings.filter((rating) => rating.rating && rating.rating >= 1 && rating.rating <= 5)

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

    const totalRating = validRatings.reduce((sum, rating) => sum + rating.rating, 0)
    const averageRating = totalRating / validRatings.length

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    validRatings.forEach((rating) => {
      if (rating.rating) {
        ratingDistribution[rating.rating]++
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

      const ratingComments = await commentModel.find({
        foodId,
        isApproved: true,
        rating: { $exists: true, $ne: null },
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

      const validRatings = ratingComments.filter((rating) => rating.rating && rating.rating >= 1 && rating.rating <= 5)

      if (validRatings.length === 0) {
        ratings.push({
          foodId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
        continue
      }

      const totalRating = validRatings.reduce((sum, rating) => sum + rating.rating, 0)
      const averageRating = totalRating / validRatings.length

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      validRatings.forEach((rating) => {
        if (rating.rating) {
          ratingDistribution[rating.rating]++
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

// Kiểm tra xem user có thể đánh giá sản phẩm không
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

    // Check existing rating
    const existingRating = await commentModel.findOne({
      userId,
      foodId,
    })

    console.log("Existing rating:", {
      hasRating: !!existingRating,
    })

    const hasPurchased = await checkUserPurchase(userId, foodId)
    console.log("Purchase check result:", hasPurchased)

    const result = {
      canReview: hasPurchased && !existingRating,
      hasPurchased,
      hasReviewed: !!existingRating,
      existingReview: existingRating
        ? {
            rating: existingRating.rating,
            comment: existingRating.comment,
            createdAt: existingRating.createdAt,
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
    const ratings = await commentModel
      .find({})
      .populate("userId", "name email")
      .populate("foodId", "name image category")
      .sort({ createdAt: -1 })

    const formattedRatings = ratings.map((rating) => ({
      _id: rating._id,
      userId: rating.userId?._id || rating.userId,
      userName: rating.userId?.name || rating.userName,
      userEmail: rating.userId?.email,
      foodId: rating.foodId?._id || rating.foodId,
      foodName: rating.foodId?.name,
      foodImage: rating.foodId?.image,
      foodCategory: rating.foodId?.category,
      rating: rating.rating,
      comment: rating.comment,
      isApproved: rating.isApproved,
      createdAt: rating.createdAt,
      adminReply: rating.adminReply
        ? {
            message: rating.adminReply,
            createdAt: rating.adminReplyAt,
          }
        : null,
    }))

    res.json({
      success: true,
      data: formattedRatings,
    })
  } catch (error) {
    console.error("Error getting all ratings:", error)
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

    const rating = await commentModel.findByIdAndUpdate(id, { isApproved }, { new: true })

    if (!rating) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({
      success: true,
      message: isApproved ? "Đã duyệt đánh giá" : "Đã hủy duyệt đánh giá",
      data: rating,
    })
  } catch (error) {
    console.error("Error toggling rating approval:", error)
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

    const rating = await commentModel.findByIdAndDelete(id)

    if (!rating) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({
      success: true,
      message: "Đã xóa đánh giá thành công",
    })
  } catch (error) {
    console.error("Error deleting rating:", error)
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

    const rating = await commentModel.findByIdAndUpdate(
      id,
      {
        adminReply: message.trim(),
        adminReplyAt: new Date(),
      },
      { new: true },
    )

    if (!rating) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({
      success: true,
      message: "Đã phản hồi đánh giá thành công",
      data: rating,
    })
  } catch (error) {
    console.error("Error replying to rating:", error)
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

// Thêm function để tạo comment test
const createTestComment = async (req, res) => {
  try {
    const { foodId } = req.body

    console.log("Creating test comment for foodId:", foodId)

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    // Kiểm tra food có tồn tại không
    const food = await foodModel.findById(foodId)
    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
    }

    // Tạo một user test hoặc lấy user đầu tiên
    const testUser = await userModel.findOne()
    if (!testUser) {
      return res.json({ success: false, message: "Không tìm thấy user nào trong hệ thống" })
    }

    // Tạo comment test
    const testComment = new commentModel({
      userId: testUser._id,
      foodId: foodId,
      rating: 5,
      comment: "Đây là comment test để kiểm tra hệ thống đánh giá. Sản phẩm rất ngon và chất lượng!",
      userName: testUser.name,
      isApproved: true,
    })

    const savedComment = await testComment.save()
    console.log("Test comment created:", savedComment._id)

    res.json({
      success: true,
      message: "Tạo comment test thành công",
      data: savedComment,
    })
  } catch (error) {
    console.error("Error creating test comment:", error)

    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "User này đã có comment cho sản phẩm này rồi",
      })
    }

    res.json({
      success: false,
      message: "Lỗi khi tạo comment test: " + error.message,
    })
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
  createTestComment,
}
