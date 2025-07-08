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

// Add a new comment
const addComment = async (req, res) => {
  try {
    console.log("Adding comment:", req.body)

    const { productId, rating, comment } = req.body
    const userId = req.user._id

    // Validate required fields
    if (!productId || !rating || !comment) {
      return res.json({
        success: false,
        message: "Product ID, rating, and comment are required",
      })
    }

    // Check if product exists
    const product = await foodModel.findById(productId)
    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      })
    }

    // Create new comment
    const newComment = new commentModel({
      userId,
      productId,
      rating: Number(rating),
      comment,
      status: "pending",
    })

    await newComment.save()

    console.log("Comment added successfully:", newComment._id)
    res.json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.json({
      success: false,
      message: "Error adding comment",
    })
  }
}

// Get comments for a specific product
const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params
    console.log("Getting comments for product:", productId)

    const comments = await commentModel
      .find({ productId, status: "approved" })
      .populate("userId", "name")
      .sort({ createdAt: -1 })

    console.log(`Found ${comments.length} approved comments for product ${productId}`)
    res.json({
      success: true,
      comments,
    })
  } catch (error) {
    console.error("Error getting comments by product:", error)
    res.json({
      success: false,
      message: "Error getting comments",
    })
  }
}

// Get all comments (admin/staff only)
const getAllComments = async (req, res) => {
  try {
    console.log("Getting all comments for admin/staff")

    const comments = await commentModel
      .find({})
      .populate("userId", "name email")
      .populate("productId", "name")
      .sort({ createdAt: -1 })

    console.log(`Found ${comments.length} total comments`)
    res.json({
      success: true,
      comments,
    })
  } catch (error) {
    console.error("Error getting all comments:", error)
    res.json({
      success: false,
      message: "Error getting comments",
    })
  }
}

// Get comments with pagination (admin/staff only)
const getComments = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const status = req.query.status || "all"

    console.log("Getting comments with pagination:", { page, limit, status })

    const filter = {}
    if (status !== "all") {
      filter.status = status
    }

    const comments = await commentModel
      .find(filter)
      .populate("userId", "name email")
      .populate("productId", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await commentModel.countDocuments(filter)

    console.log(`Found ${comments.length} comments (page ${page}/${Math.ceil(total / limit)})`)
    res.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error getting comments:", error)
    res.json({
      success: false,
      message: "Error getting comments",
    })
  }
}

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user._id

    console.log("Updating comment:", id, "by user:", userId)

    // Find the comment
    const existingComment = await commentModel.findById(id)
    if (!existingComment) {
      return res.json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user owns the comment or is admin/staff
    if (
      existingComment.userId.toString() !== userId.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.json({
        success: false,
        message: "Not authorized to update this comment",
      })
    }

    // Update comment
    const updatedComment = await commentModel
      .findByIdAndUpdate(
        id,
        {
          rating: rating ? Number(rating) : existingComment.rating,
          comment: comment || existingComment.comment,
          status: "pending", // Reset to pending after edit
        },
        { new: true },
      )
      .populate("userId", "name")

    console.log("Comment updated successfully:", id)
    res.json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    })
  } catch (error) {
    console.error("Error updating comment:", error)
    res.json({
      success: false,
      message: "Error updating comment",
    })
  }
}

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    console.log("Deleting comment:", id, "by user:", userId)

    // Find the comment
    const comment = await commentModel.findById(id)
    if (!comment) {
      return res.json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user owns the comment or is admin/staff
    if (comment.userId.toString() !== userId.toString() && req.user.role !== "admin" && req.user.role !== "staff") {
      return res.json({
        success: false,
        message: "Not authorized to delete this comment",
      })
    }

    await commentModel.findByIdAndDelete(id)

    console.log("Comment deleted successfully:", id)
    res.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    res.json({
      success: false,
      message: "Error deleting comment",
    })
  }
}

// Approve comment (admin/staff only)
const approveComment = async (req, res) => {
  try {
    const { id } = req.params
    console.log("Approving comment:", id, "by:", req.user.name)

    const comment = await commentModel
      .findByIdAndUpdate(id, { status: "approved" }, { new: true })
      .populate("userId", "name")

    if (!comment) {
      return res.json({
        success: false,
        message: "Comment not found",
      })
    }

    console.log("Comment approved successfully:", id)
    res.json({
      success: true,
      message: "Comment approved successfully",
      comment,
    })
  } catch (error) {
    console.error("Error approving comment:", error)
    res.json({
      success: false,
      message: "Error approving comment",
    })
  }
}

// Reject comment (admin/staff only)
const rejectComment = async (req, res) => {
  try {
    const { id } = req.params
    console.log("Rejecting comment:", id, "by:", req.user.name)

    const comment = await commentModel
      .findByIdAndUpdate(id, { status: "rejected" }, { new: true })
      .populate("userId", "name")

    if (!comment) {
      return res.json({
        success: false,
        message: "Comment not found",
      })
    }

    console.log("Comment rejected successfully:", id)
    res.json({
      success: true,
      message: "Comment rejected successfully",
      comment,
    })
  } catch (error) {
    console.error("Error rejecting comment:", error)
    res.json({
      success: false,
      message: "Error rejecting comment",
    })
  }
}

export {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  getCommentsByProduct,
  approveComment,
  rejectComment,
  getAllComments,
  debugUserOrders,
}
