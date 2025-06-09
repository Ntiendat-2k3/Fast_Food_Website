import Order from "../models/orderModel.js"
import userModel from "../models/userModel.js"

// placing user order from frontend
const placeOrder = async (req, res) => {
  try {
    console.log("Order data received:", req.body) // Debug log

    const { items, amount, address, paymentMethod, shippingFee, discountAmount, voucherCode } = req.body
    const userId = req.user._id

    const newOrder = new Order({
      userId,
      items,
      amount,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Chưa thanh toán" : "Đang xử lý",
      shippingFee,
      discountAmount,
      voucherCode,
    })

    console.log("New order to be saved:", {
      voucherCode: newOrder.voucherCode,
      discountAmount: newOrder.discountAmount,
    }) // Debug log

    const savedOrder = await newOrder.save()
    await userModel.findByIdAndUpdate(userId, { cartData: {} })

    // Trả về thông tin đơn hàng
    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: savedOrder,
    })
  } catch (error) {
    console.error("Error placing order:", error)
    res.status(500).json({
      success: false,
      message: "Đặt hàng thất bại",
      error: error.message,
    })
  }
}

// Verify order
const verifyOrder = async (req, res) => {
  try {
    const { orderId, status } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      })
    }

    order.status = status
    order.paymentStatus = "Đã thanh toán"
    await order.save()

    res.status(200).json({
      success: true,
      message: "Xác nhận đơn hàng thành công",
      data: order,
    })
  } catch (error) {
    console.error("Error verifying order:", error)
    res.status(500).json({
      success: false,
      message: "Xác nhận đơn hàng thất bại",
      error: error.message,
    })
  }
}

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const userId = req.user._id

    const orders = await Order.find({ userId }).sort({ date: -1 })
    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    })
  } catch (error) {
    console.error("Error getting user orders:", error)
    res.status(500).json({
      success: false,
      message: "Lấy danh sách đơn hàng thất bại",
      error: error.message,
    })
  }
}

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 })
    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    })
  } catch (error) {
    console.error("Error listing orders:", error)
    res.status(500).json({
      success: false,
      message: "Lấy danh sách đơn hàng thất bại",
      error: error.message,
    })
  }
}

// api for updating order status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      })
    }

    order.status = status
    await order.save()

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({
      success: false,
      message: "Cập nhật trạng thái đơn hàng thất bại",
      error: error.message,
    })
  }
}

// api for updating payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      })
    }

    order.paymentStatus = paymentStatus
    await order.save()

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công",
      data: order,
    })
  } catch (error) {
    console.error("Error updating payment status:", error)
    res.status(500).json({
      success: false,
      message: "Cập nhật trạng thái thanh toán thất bại",
      error: error.message,
    })
  }
}

// Get purchase history with filters and pagination
const getPurchaseHistory = async (req, res) => {
  console.log("=== PURCHASE HISTORY CONTROLLER ===")
  console.log("Request received:", {
    body: req.body,
    query: req.query,
    user: req.user,
    headers: req.headers,
  })

  try {
    // Get userId from either req.user (set by middleware) or req.body
    const userId = req.user?._id || req.body.userId

    if (!userId) {
      console.log("No userId provided")
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy ID người dùng",
      })
    }

    console.log(`Fetching orders for user: ${userId}`)

    // Parse query parameters
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const status = req.query.status !== "all" ? req.query.status : null
    const search = req.query.search || ""
    const sortBy = req.query.sortBy || "newest"
    const timeRange = req.query.timeRange || "all"

    console.log("Query parameters:", { page, limit, status, search, sortBy, timeRange })

    // Build query
    const query = { userId: userId }

    // Add status filter if provided
    if (status) {
      let statusValue
      switch (status) {
        case "processing":
          statusValue = "Đang xử lý"
          break
        case "shipping":
          statusValue = "Đang giao hàng"
          break
        case "delivered":
          statusValue = "Đã giao hàng"
          break
        case "cancelled":
          statusValue = "Đã hủy"
          break
      }
      if (statusValue) query.status = statusValue
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: "i" } },
        { "address.name": { $regex: search, $options: "i" } },
        { "address.phone": { $regex: search, $options: "i" } },
      ]
    }

    // Add time range filter if provided
    if (timeRange !== "all") {
      const now = new Date()
      let startDate

      switch (timeRange) {
        case "30days":
          startDate = new Date(now.setDate(now.getDate() - 30))
          break
        case "3months":
          startDate = new Date(now.setMonth(now.getMonth() - 3))
          break
        case "6months":
          startDate = new Date(now.setMonth(now.getMonth() - 6))
          break
        case "1year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
      }

      if (startDate) {
        query.date = { $gte: startDate }
      }
    }

    console.log("Final query:", JSON.stringify(query))

    // Build sort
    let sort = {}
    switch (sortBy) {
      case "newest":
        sort = { date: -1 }
        break
      case "oldest":
        sort = { date: 1 }
        break
      case "highest":
        sort = { amount: -1 }
        break
      case "lowest":
        sort = { amount: 1 }
        break
      default:
        sort = { date: -1 }
    }

    console.log("Sort:", sort)

    // Execute query
    const orders = await Order.find(query).sort(sort).skip(skip).limit(limit)
    const totalOrders = await Order.countDocuments(query)
    const totalPages = Math.ceil(totalOrders / limit)

    // Calculate total spent
    const allOrders = await Order.find({ userId: userId })
    const totalSpent = allOrders.reduce((sum, order) => sum + order.amount, 0)

    console.log(`Found ${orders.length} orders out of ${totalOrders} total`)

    res.status(200).json({
      success: true,
      message: "Lấy lịch sử mua hàng thành công",
      data: orders,
      totalPages,
      totalOrders,
      totalSpent,
      currentPage: page,
      debug: {
        query,
        sort,
        userId,
        requestBody: req.body,
        requestQuery: req.query,
      },
    })
  } catch (error) {
    console.error("Error getting purchase history:", error)
    res.status(500).json({
      success: false,
      message: "Lấy lịch sử mua hàng thất bại",
      error: error.message,
    })
  }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, updatePaymentStatus, getPurchaseHistory }
