import commentModel from "../models/commentModel.js"
import userModel from "../models/userModel.js"
import mongoose from "mongoose"
import orderModel from "../models/orderModel.js"
import foodModel from "../models/foodModel.js"

// Kiểm tra xem user đã mua sản phẩm này và đơn hàng đã hoàn thành chưa
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

    // Tìm các đơn hàng đã hoàn thành của user
    const completedOrders = await orderModel.find({
      userId: userId,
      status: "Đã hoàn thành", // Chỉ cho phép đánh giá khi đơn hàng đã hoàn thành
    })

    console.log(`\n=== COMPLETED ORDERS FOR USER ===`)
    console.log(`Total completed orders found: ${completedOrders.length}`)

    if (completedOrders.length === 0) {
      console.log("❌ No completed orders found for user")
      return false
    }

    // Kiểm tra từng đơn hàng đã hoàn thành
    for (let i = 0; i < completedOrders.length; i++) {
      const order = completedOrders[i]
      console.log(`\n--- Checking Completed Order ${i + 1} ---`)
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

    console.log("❌ No matching product found in any completed order")
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

    // Kiểm tra existing rating
    const existingRating = await commentModel.findOne({ userId, foodId })

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
        hasRated: !!existingRating,
        canRate: hasPurchased && !existingRating,
      },
    })
  } catch (error) {
    console.error("Error in debug:", error)
    res.json({ success: false, message: "Lỗi debug: " + error.message })
  }
}

// Thêm đánh giá mới
const addRating = async (req, res) => {
  try {
    const { userId, foodId, rating } = req.body

    console.log("Adding rating:", { userId, foodId, rating })

    // Validate required fields
    if (!userId || !foodId || !rating) {
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

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" })
    }

    // Lấy thông tin người dùng
    const user = await userModel.findById(userId)
    if (!user) {
      console.log("User not found with ID:", userId)
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Kiểm tra xem user đã đánh giá sản phẩm này chưa
    const existingRating = await commentModel.findOne({ userId, foodId })
    if (existingRating) {
      return res.json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi. Bạn có thể chỉnh sửa đánh giá hiện có.",
      })
    }

    // KIỂM TRA XEM USER ĐÃ MUA SẢN PHẨM NÀY VÀ ĐƠN HÀNG ĐÃ HOÀN THÀNH CHƯA - BẮT BUỘC
    const hasPurchased = await checkUserPurchase(userId, foodId)
    if (!hasPurchased) {
      return res.json({
        success: false,
        message: "Bạn cần mua và hoàn thành đơn hàng chứa sản phẩm này trước khi có thể đánh giá",
      })
    }

    // Tạo rating mới
    const newRating = new commentModel({
      userId,
      foodId,
      rating: Number(rating),
      userName: user.name,
      isApproved: true,
    })

    const savedRating = await newRating.save()
    console.log("Rating saved successfully:", savedRating._id)

    res.json({
      success: true,
      message: "Thêm đánh giá thành công",
      data: {
        _id: savedRating._id,
        userId: savedRating.userId,
        userName: user.name,
        foodId: savedRating.foodId,
        rating: savedRating.rating,
        createdAt: savedRating.createdAt,
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

// Cập nhật đánh giá
const updateRating = async (req, res) => {
  try {
    const { ratingId, rating, userId } = req.body

    console.log("Updating rating:", { ratingId, rating, userId })

    // Validate required fields
    if (!ratingId || !rating || !userId) {
      return res.json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      })
    }

    // Validate ratingId
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, message: "ID người dùng không hợp lệ" })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" })
    }

    // Tìm rating
    const existingRating = await commentModel.findById(ratingId)
    if (!existingRating) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    // Kiểm tra quyền sở hữu
    if (existingRating.userId.toString() !== userId) {
      return res.json({ success: false, message: "Bạn chỉ có thể sửa đánh giá của chính mình" })
    }

    // Cập nhật rating
    const updatedRating = await commentModel.findByIdAndUpdate(
      ratingId,
      {
        rating: Number(rating),
        updatedAt: new Date(),
      },
      { new: true },
    )

    console.log("Rating updated successfully:", updatedRating._id)

    res.json({
      success: true,
      message: "Cập nhật đánh giá thành công",
      data: {
        _id: updatedRating._id,
        userId: updatedRating.userId,
        userName: updatedRating.userName,
        foodId: updatedRating.foodId,
        rating: updatedRating.rating,
        createdAt: updatedRating.createdAt,
        updatedAt: updatedRating.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error updating rating:", error)
    res.json({
      success: false,
      message: "Lỗi khi cập nhật đánh giá: " + error.message,
    })
  }
}

// Lấy danh sách đánh giá theo sản phẩm
const getRatingsByFood = async (req, res) => {
  try {
    const { foodId } = req.params
    console.log("Getting ratings for food:", foodId)

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.json({ success: false, message: "ID sản phẩm không hợp lệ" })
    }

    const ratings = await commentModel.find({ foodId, isApproved: true }).sort({ createdAt: -1 })

    console.log(`Found ${ratings.length} ratings for food ${foodId}`)
    res.json({ success: true, data: ratings })
  } catch (error) {
    console.error("Error getting ratings:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đánh giá" })
  }
}

// Lấy tất cả đánh giá (cho admin)
const getAllRatings = async (req, res) => {
  try {
    const ratings = await commentModel.find({}).sort({ createdAt: -1 })
    res.json({ success: true, data: ratings })
  } catch (error) {
    console.error("Error getting all ratings:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đánh giá" })
  }
}

// Xóa đánh giá
const deleteRating = async (req, res) => {
  try {
    const { id } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const deletedRating = await commentModel.findByIdAndDelete(id)

    if (!deletedRating) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({ success: true, message: "Xóa đánh giá thành công" })
  } catch (error) {
    console.error("Error deleting rating:", error)
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

    const ratings = await commentModel.find({ foodId, isApproved: true })

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

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0)
    const averageRating = totalRating / ratings.length

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach((rating) => {
      ratingDistribution[rating.rating]++
    })

    res.json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: ratings.length,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error("Error getting rating stats:", error)
    res.json({ success: false, message: "Lỗi khi lấy thống kê đánh giá" })
  }
}

// Cập nhật trạng thái đánh giá
const updateRatingStatus = async (req, res) => {
  try {
    const { id, isApproved } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đánh giá không hợp lệ" })
    }

    const updatedRating = await commentModel.findByIdAndUpdate(id, { isApproved }, { new: true })

    if (!updatedRating) {
      return res.json({ success: false, message: "Không tìm thấy đánh giá" })
    }

    res.json({ success: true, message: "Cập nhật trạng thái đánh giá thành công" })
  } catch (error) {
    console.error("Error updating rating status:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật trạng thái đánh giá" })
  }
}

// Kiểm tra xem user có thể đánh giá sản phẩm không
const checkCanRate = async (req, res) => {
  try {
    const { userId, foodId } = req.params
    console.log(`\n=== CHECK CAN RATE API ===`)
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
    const existingRating = await commentModel.findOne({ userId, foodId })
    console.log(`Has existing rating: ${!!existingRating}`)

    // Kiểm tra xem đã mua sản phẩm và đơn hàng đã hoàn thành chưa
    const hasPurchased = await checkUserPurchase(userId, foodId)
    console.log(`Has purchased and completed: ${hasPurchased}`)

    const canRate = hasPurchased && !existingRating
    console.log(`Can rate: ${canRate}`)

    // Thêm thông tin debug về đơn hàng
    const userOrders = await orderModel.find({ userId }).select("status payment paymentStatus items date")
    console.log(`User has ${userOrders.length} total orders`)

    res.json({
      success: true,
      data: {
        canRate,
        hasPurchased,
        hasRated: !!existingRating,
        existingRating: existingRating,
        debug: {
          userName: user.name,
          foodName: food.name,
          totalOrders: userOrders.length,
          completedOrders: userOrders.filter((o) => o.status === "Đã hoàn thành").length,
          orderStatuses: userOrders.map((o) => ({
            status: o.status,
            payment: o.payment,
            paymentStatus: o.paymentStatus,
          })),
        },
      },
    })
  } catch (error) {
    console.error("Error checking rating eligibility:", error)
    res.json({ success: false, message: "Lỗi khi kiểm tra quyền đánh giá" })
  }
}

export {
  addRating,
  updateRating,
  getRatingsByFood,
  getAllRatings,
  updateRatingStatus,
  deleteRating,
  getFoodRatingStats,
  checkCanRate,
  debugUserOrders,
}
