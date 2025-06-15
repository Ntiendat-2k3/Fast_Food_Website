import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import orderModel from "../models/orderModel.js"
import foodModel from "../models/foodModel.js"

// Kiểm tra xem user đã mua sản phẩm này chưa
const checkUserPurchase = async (userId, foodId) => {
  try {
    console.log(`=== CHECKING PURCHASE HISTORY ===`)
    console.log(`User ID: ${userId}`)
    console.log(`Food ID: ${foodId}`)

    // Lấy thông tin sản phẩm để có tên sản phẩm
    const food = await foodModel.findById(foodId)
    if (!food) {
      console.log("Food not found with ID:", foodId)
      return false
    }
    console.log(`Food name: ${food.name}`)

    // Tìm TẤT CẢ đơn hàng của user
    const allOrders = await orderModel.find({ userId: userId })
    console.log(`\n=== ALL ORDERS FOR USER ===`)
    console.log(`Total orders found: ${allOrders.length}`)

    if (allOrders.length === 0) {
      console.log("❌ No orders found for user")
      return false
    }

    // Sửa logic filter đơn hàng hợp lệ
    const validOrders = allOrders.filter((order) => {
      // Điều kiện thanh toán: payment = true HOẶC paymentStatus = "Đã thanh toán"
      const isPaid = order.payment === true || order.paymentStatus === "Đã thanh toán"

      // Điều kiện trạng thái: không phải "Hủy" hoặc "Cancelled"
      const validStatus = order.status && !["Hủy", "Cancelled"].includes(order.status)

      console.log(`\nOrder ${order._id} validation:`)
      console.log(`- payment: ${order.payment}`)
      console.log(`- paymentStatus: ${order.paymentStatus}`)
      console.log(`- status: ${order.status}`)
      console.log(`- isPaid: ${isPaid}`)
      console.log(`- validStatus: ${validStatus}`)
      console.log(`- final result: ${isPaid && validStatus}`)

      return isPaid && validStatus
    })

    console.log(`\n=== VALID ORDERS ===`)
    console.log(`Valid orders count: ${validOrders.length}`)

    if (validOrders.length === 0) {
      console.log("❌ No valid orders found")
      return false
    }

    // Kiểm tra từng đơn hàng hợp lệ
    for (let i = 0; i < validOrders.length; i++) {
      const order = validOrders[i]
      console.log(`\n--- Checking Valid Order ${i + 1} ---`)
      console.log(`Order ID: ${order._id}`)

      if (!order.items || order.items.length === 0) {
        console.log("No items in this order")
        continue
      }

      // Kiểm tra từng item trong đơn hàng
      for (let j = 0; j < order.items.length; j++) {
        const item = order.items[j]
        console.log(`\n  Checking Item ${j + 1}:`)
        console.log(`  - Item name: "${item.name}"`)
        console.log(`  - Food name: "${food.name}"`)
        console.log(`  - Item foodId: ${item.foodId}`)
        console.log(`  - Target foodId: ${foodId}`)

        // Kiểm tra theo nhiều cách khác nhau
        let isMatch = false

        // 1. Kiểm tra theo foodId (ưu tiên cao nhất)
        if (item.foodId) {
          const itemFoodId = item.foodId.toString()
          const targetFoodId = foodId.toString()
          if (itemFoodId === targetFoodId) {
            console.log(`  ✅ MATCH FOUND by foodId: ${item.foodId} === ${foodId}`)
            isMatch = true
          }
        }

        // 2. Kiểm tra theo tên sản phẩm (case-insensitive)
        if (!isMatch && item.name && food.name) {
          const itemName = item.name.toLowerCase().trim()
          const foodName = food.name.toLowerCase().trim()
          if (itemName === foodName) {
            console.log(`  ✅ MATCH FOUND by name: "${item.name}" === "${food.name}"`)
            isMatch = true
          }
        }

        // 3. Kiểm tra theo _id
        if (!isMatch && item._id) {
          const itemId = item._id.toString()
          const targetFoodId = foodId.toString()
          if (itemId === targetFoodId) {
            console.log(`  ✅ MATCH FOUND by _id: ${item._id}`)
            isMatch = true
          }
        }

        // 4. Kiểm tra theo id
        if (!isMatch && item.id) {
          const itemIdField = item.id.toString()
          const targetFoodId = foodId.toString()
          if (itemIdField === targetFoodId) {
            console.log(`  ✅ MATCH FOUND by id: ${item.id}`)
            isMatch = true
          }
        }

        if (isMatch) {
          console.log(`  🎉 PURCHASE CONFIRMED!`)
          return true
        } else {
          console.log(`  ❌ No match for this item`)
        }
      }
    }

    console.log("❌ No matching product found in any valid order")
    return false
  } catch (error) {
    console.error("Error checking user purchase:", error)
    return false
  }
}

// Thêm endpoint debug để xem dữ liệu thực tế
const debugUserOrders = async (req, res) => {
  try {
    const { userId, foodId } = req.params

    console.log(`=== DEBUG USER ORDERS ===`)
    console.log(`User ID: ${userId}`)
    console.log(`Food ID: ${foodId}`)

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID không hợp lệ" })
    }

    // Lấy thông tin user
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy user" })
    }

    // Lấy thông tin food
    const food = await foodModel.findById(foodId)
    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
    }

    // Lấy tất cả đơn hàng của user
    const orders = await orderModel.find({ userId: userId }).sort({ date: -1 })

    // Kiểm tra purchase
    const hasPurchased = await checkUserPurchase(userId, foodId)

    // Kiểm tra existing comment
    const existingComment = await commentModel.findOne({ userId, foodId })

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        food: {
          id: food._id,
          name: food.name,
          category: food.category,
        },
        orders: orders.map((order) => ({
          id: order._id,
          status: order.status,
          payment: order.payment,
          paymentStatus: order.paymentStatus,
          date: order.date,
          amount: order.amount,
          itemsCount: order.items ? order.items.length : 0,
          items: order.items || [],
        })),
        hasPurchased,
        hasReviewed: !!existingComment,
        canReview: hasPurchased && !existingComment,
      },
    })
  } catch (error) {
    console.error("Error in debug:", error)
    res.json({ success: false, message: "Lỗi debug: " + error.message })
  }
}

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

    // Kiểm tra xem user đã đánh giá sản phẩm này chưa
    const existingComment = await commentModel.findOne({ userId, foodId })
    if (existingComment) {
      return res.json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi. Bạn có thể chỉnh sửa đánh giá hiện có.",
      })
    }

    // KIỂM TRA XEM USER ĐÃ MUA SẢN PHẨM NÀY CHƯA - BẮT BUỘC
    const hasPurchased = await checkUserPurchase(userId, foodId)
    if (!hasPurchased) {
      return res.json({
        success: false,
        message: "Bạn cần mua và nhận được sản phẩm này trước khi có thể đánh giá",
      })
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

// Kiểm tra xem user có thể đánh giá sản phẩm không
const checkCanReview = async (req, res) => {
  try {
    const { userId, foodId } = req.params
    console.log(`\n=== CHECK CAN REVIEW API ===`)
    console.log(`User ID: ${userId}`)
    console.log(`Food ID: ${foodId}`)

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID không hợp lệ" })
    }

    // Kiểm tra user tồn tại
    const user = await userModel.findById(userId)
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Kiểm tra sản phẩm tồn tại
    const food = await foodModel.findById(foodId)
    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
    }

    // Kiểm tra xem đã đánh giá chưa
    const existingComment = await commentModel.findOne({ userId, foodId })
    console.log(`Has existing review: ${!!existingComment}`)

    // Kiểm tra xem đã mua sản phẩm chưa
    const hasPurchased = await checkUserPurchase(userId, foodId)
    console.log(`Has purchased: ${hasPurchased}`)

    const canReview = hasPurchased && !existingComment
    console.log(`Can review: ${canReview}`)

    // Thêm thông tin debug về đơn hàng
    const userOrders = await orderModel.find({ userId }).select("status payment paymentStatus items date")
    console.log(`User has ${userOrders.length} total orders`)

    res.json({
      success: true,
      data: {
        canReview,
        hasPurchased,
        hasReviewed: !!existingComment,
        existingReview: existingComment,
        debug: {
          userName: user.name,
          foodName: food.name,
          totalOrders: userOrders.length,
          paidOrders: userOrders.filter((o) => o.payment === true || o.paymentStatus === "Đã thanh toán").length,
          orderStatuses: userOrders.map((o) => ({
            status: o.status,
            payment: o.payment,
            paymentStatus: o.paymentStatus,
          })),
        },
      },
    })
  } catch (error) {
    console.error("Error checking review eligibility:", error)
    res.json({ success: false, message: "Lỗi khi kiểm tra quyền đánh giá" })
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
  checkCanReview,
  debugUserOrders,
}
