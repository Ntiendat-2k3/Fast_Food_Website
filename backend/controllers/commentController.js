import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import orderModel from "../models/orderModel.js"
import foodModel from "../models/foodModel.js"

// Kiểm tra xem user đã mua sản phẩm này chưa
const checkUserPurchase = async (userId, foodId) => {
  try {
    const food = await foodModel.findById(foodId)
    if (!food) {
      return false
    }

    const allOrders = await orderModel.find({ userId: userId })
    if (allOrders.length === 0) {
      return false
    }

    const validOrders = allOrders.filter((order) => {
      const isPaid = order.payment === true || order.paymentStatus === "Đã thanh toán"
      const validStatus = order.status && !["Hủy", "Cancelled"].includes(order.status)
      return isPaid && validStatus
    })

    if (validOrders.length === 0) {
      return false
    }

    for (let i = 0; i < validOrders.length; i++) {
      const order = validOrders[i]
      if (!order.items || order.items.length === 0) {
        continue
      }

      for (let j = 0; j < order.items.length; j++) {
        const item = order.items[j]
        let isMatch = false

        if (item.foodId) {
          const itemFoodId = item.foodId.toString()
          const targetFoodId = foodId.toString()
          if (itemFoodId === targetFoodId) {
            isMatch = true
          }
        }

        if (!isMatch && item.name && food.name) {
          const itemName = item.name.toLowerCase().trim()
          const foodName = food.name.toLowerCase().trim()
          if (itemName === foodName) {
            isMatch = true
          }
        }

        if (!isMatch && item._id) {
          const itemId = item._id.toString()
          const targetFoodId = foodId.toString()
          if (itemId === targetFoodId) {
            isMatch = true
          }
        }

        if (!isMatch && item.id) {
          const itemIdField = item.id.toString()
          const targetFoodId = foodId.toString()
          if (itemIdField === targetFoodId) {
            isMatch = true
          }
        }

        if (isMatch) {
          return true
        }
      }
    }

    return false
  } catch (error) {
    console.error("Error checking user purchase:", error)
    return false
  }
}

// Thêm rating mới
const addComment = async (req, res) => {
  try {
    const { userId, foodId, rating } = req.body

    if (!userId || !foodId || !rating) {
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

    if (rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" })
    }

    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    const existingComment = await commentModel.findOne({ userId, foodId })
    if (existingComment) {
      return res.json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi.",
      })
    }

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
      comment: "Đánh giá sao",
      userName: user.name,
      isApproved: true,
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
        createdAt: savedComment.createdAt,
      },
    })
  } catch (error) {
    console.error("Error adding rating:", error)
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

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    const comments = await commentModel.find({ foodId, isApproved: true }).sort({ createdAt: -1 })

    res.json({ success: true, data: comments })
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

      const comments = await commentModel.find({ foodId, isApproved: true })

      if (comments.length === 0) {
        ratings.push({
          foodId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
        continue
      }

      const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0)
      const averageRating = totalRating / comments.length

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      comments.forEach((comment) => {
        ratingDistribution[comment.rating]++
      })

      ratings.push({
        foodId,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: comments.length,
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

    const existingComment = await commentModel.findOne({ userId, foodId })
    const hasPurchased = await checkUserPurchase(userId, foodId)
    const canReview = hasPurchased && !existingComment

    res.json({
      success: true,
      data: {
        canReview,
        hasPurchased,
        hasReviewed: !!existingComment,
        existingReview: existingComment
          ? {
              rating: existingComment.rating,
              createdAt: existingComment.createdAt,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Error checking review eligibility:", error)
    res.json({ success: false, message: "Lỗi khi kiểm tra quyền đánh giá" })
  }
}

export { addComment, getCommentsByFood, getFoodRatingStats, getBatchRatings, checkCanReview }
