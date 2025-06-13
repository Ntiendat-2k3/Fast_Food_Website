import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js" // Thêm import userModel

// placing user order from frontend
const placeOrder = async (req, res) => {
  try {
    console.log("Order data received:", req.body) // Debug log

    // Kiểm tra dữ liệu đầu vào
    const { userId, items, amount, address, paymentMethod, voucherCode, discountAmount } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Không có sản phẩm nào trong đơn hàng" })
    }

    if (!address || !address.name || !address.street || !address.phone) {
      return res.json({ success: false, message: "Thông tin địa chỉ không đầy đủ" })
    }

    // Tạo đơn hàng mới
    const newOrder = new orderModel({
      userId: userId,
      items: items,
      amount: amount,
      address: address,
      date: new Date(),
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? "Chưa thanh toán" : "Đang xử lý",
      voucherCode: voucherCode || null,
      discountAmount: discountAmount || 0,
    })

    console.log("New order to be saved:", {
      userId: newOrder.userId,
      items: newOrder.items.length,
      amount: newOrder.amount,
      voucherCode: newOrder.voucherCode,
      discountAmount: newOrder.discountAmount,
    }) // Debug log

    // Lưu đơn hàng
    const savedOrder = await newOrder.save()

    // Xóa giỏ hàng của người dùng
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { cartData: {} })
    }

    // Trả về thông tin đơn hàng
    res.json({
      success: true,
      message: "Đặt hàng thành công",
      orderId: savedOrder._id,
      redirectUrl: paymentMethod === "COD" ? "/thankyou" : `/payment/${paymentMethod}/${savedOrder._id}`,
    })
  } catch (error) {
    console.log("Error placing order:", error)
    res.json({ success: false, message: "Lỗi khi đặt hàng" })
  }
}

// Các hàm khác giữ nguyên
const verifyOrder = async (req, res) => {
  const { orderId, success, paymentMethod } = req.body
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, {
        paymentStatus: "Đã thanh toán",
        paymentMethod: paymentMethod,
      })
      res.json({ success: true, message: "Thanh toán thành công" })
    } else {
      // Không xóa đơn hàng, chỉ cập nhật trạng thái thanh toán
      await orderModel.findByIdAndUpdate(orderId, {
        paymentStatus: "Thanh toán thất bại",
      })
      res.json({ success: true, message: "Thanh toán thất bại" })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi xác minh thanh toán" })
  }
}

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId })
    res.json({ success: true, data: orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng" })
  }
}

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
    console.log(
      "Orders from database:",
      orders.map((order) => ({
        id: order._id,
        voucherCode: order.voucherCode,
        discountAmount: order.discountAmount,
      })),
    ) // Debug log

    res.json({ success: true, data: orders })
  } catch (error) {
    console.log("Error listing orders:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng" })
  }
}

// api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    })
    res.json({ success: true, message: "Cập nhật trạng thái thành công" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi cập nhật trạng thái" })
  }
}

// api for updating payment status
const updatePaymentStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      paymentStatus: req.body.paymentStatus,
    })
    res.json({ success: true, message: "Cập nhật trạng thái thanh toán thành công" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi cập nhật trạng thái thanh toán" })
  }
}

// Lấy lịch sử mua hàng của người dùng
const getUserPurchaseHistory = async (req, res) => {
  try {
    const { userId } = req.body
    const { page = 1, limit = 10, sortBy = "newest", search = "", timeRange = "all", status = "all" } = req.query

    console.log("Getting purchase history for user:", userId)
    console.log("Query params:", { page, limit, sortBy, search, timeRange, status })

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy ID người dùng",
      })
    }

    // Build query - Lấy tất cả đơn hàng đã giao
    const query = {
      userId,
      $or: [{ status: "Đã giao hàng" }, { status: "Đã giao" }],
    }

    // Add search filter
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { "items.name": { $regex: search, $options: "i" } },
            { voucherCode: { $regex: search, $options: "i" } },
            { "address.name": { $regex: search, $options: "i" } },
            { "address.phone": { $regex: search, $options: "i" } },
            { _id: { $regex: search, $options: "i" } },
          ],
        },
      ]
      delete query.$or
    }

    // Add time range filter
    if (timeRange !== "all") {
      const now = new Date()
      let startDate

      switch (timeRange) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "3months":
          startDate = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000)
          break
        case "6months":
          startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
          break
        case "1year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }

      if (startDate) {
        query.date = { $gte: startDate }
      }
    }

    // Sort options
    let sortOptions = {}
    switch (sortBy) {
      case "newest":
        sortOptions = { date: -1 }
        break
      case "oldest":
        sortOptions = { date: 1 }
        break
      case "highest":
        sortOptions = { amount: -1 }
        break
      case "lowest":
        sortOptions = { amount: 1 }
        break
      default:
        sortOptions = { date: -1 }
    }

    console.log("Final query:", JSON.stringify(query, null, 2))

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query
    const orders = await orderModel.find(query).sort(sortOptions).skip(skip).limit(Number.parseInt(limit)).lean()

    console.log("Found orders:", orders.length)

    const totalOrders = await orderModel.countDocuments(query)
    const totalPages = Math.ceil(totalOrders / Number.parseInt(limit))

    // Calculate statistics for all completed orders
    const allCompletedOrders = await orderModel.find({
      userId,
      $or: [{ status: "Đã giao hàng" }, { status: "Đã giao" }],
    })

    const totalSpent = allCompletedOrders.reduce((sum, order) => sum + order.amount, 0)
    const totalItems = allCompletedOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)

    console.log("Stats:", {
      totalSpent,
      totalOrders: allCompletedOrders.length,
      totalItems,
    })

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        totalPages,
        currentPage: Number.parseInt(page),
        totalItems: totalOrders,
      },
      stats: {
        totalSpent,
        totalOrders: allCompletedOrders.length,
        totalItems,
      },
    })
  } catch (error) {
    console.error("Error getting purchase history:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử mua hàng",
      error: error.message,
    })
  }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, updatePaymentStatus, getUserPurchaseHistory }
