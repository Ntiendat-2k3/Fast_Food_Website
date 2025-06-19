import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import notificationModel from "../models/notificationModel.js"

// placing user order from frontend
const placeOrder = async (req, res) => {
  try {
    console.log("Order data received:", req.body) // Debug log

    // Kiểm tra dữ liệu đầu vào
    const {
      userId,
      items,
      amount,
      address,
      paymentMethod,
      voucherCode,
      discountAmount,
      shippingFee,
      deliveryFee,
      distance,
      subtotal,
      itemsTotal,
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Không có sản phẩm nào trong đơn hàng" })
    }

    if (!address || !address.name || !address.street || !address.phone) {
      return res.json({ success: false, message: "Thông tin địa chỉ không đầy đủ" })
    }

    // Tạo đơn hàng mới với đầy đủ thông tin
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
      // Lưu thông tin phí ship
      shippingFee: shippingFee || deliveryFee || 14000,
      deliveryFee: deliveryFee || shippingFee || 14000,
      distance: distance || null,
      subtotal: subtotal || itemsTotal || 0,
      itemsTotal: itemsTotal || subtotal || 0,
    })

    console.log("New order to be saved:", {
      userId: newOrder.userId,
      items: newOrder.items.length,
      amount: newOrder.amount,
      voucherCode: newOrder.voucherCode,
      discountAmount: newOrder.discountAmount,
      shippingFee: newOrder.shippingFee,
      deliveryFee: newOrder.deliveryFee,
      distance: newOrder.distance,
    }) // Debug log

    // Lưu đơn hàng
    const savedOrder = await newOrder.save()

    // Tạo notification cho admin
    const notification = new notificationModel({
      title: "Đơn hàng mới",
      message: `Đơn hàng mới từ ${address.name} - ${amount.toLocaleString("vi-VN")} đ`,
      type: "order",
      orderId: savedOrder._id,
      userId: userId,
      createdAt: new Date(),
    })

    await notification.save()

    // Emit real-time notification to admin
    if (req.io) {
      req.io.emit("newOrder", {
        id: savedOrder._id,
        customerName: address.name,
        amount: amount,
        items: items.length,
        paymentMethod: paymentMethod,
        createdAt: savedOrder.date,
      })

      req.io.emit("newNotification", {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        orderId: savedOrder._id,
        userId: userId,
        createdAt: notification.createdAt,
        isRead: false,
      })
    }

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

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
    console.log(
      "Orders from database with shipping info:",
      orders.map((order) => ({
        id: order._id,
        voucherCode: order.voucherCode,
        discountAmount: order.discountAmount,
        shippingFee: order.shippingFee,
        deliveryFee: order.deliveryFee,
        distance: order.distance,
      })),
    ) // Debug log

    res.json({ success: true, data: orders })
  } catch (error) {
    console.log("Error listing orders:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng" })
  }
}

// Thống kê revenue theo thời gian
const getRevenueStats = async (req, res) => {
  try {
    const { period = "month", year, month } = req.query

    let matchStage = {}
    let groupStage = {}
    let sortStage = {}

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    switch (period) {
      case "day":
        // Thống kê theo ngày trong tháng
        const targetYear = year ? Number.parseInt(year) : currentYear
        const targetMonth = month ? Number.parseInt(month) : currentMonth

        matchStage = {
          date: {
            $gte: new Date(targetYear, targetMonth - 1, 1),
            $lt: new Date(targetYear, targetMonth, 1),
          },
        }

        groupStage = {
          _id: { $dayOfMonth: "$date" },
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          date: { $first: "$date" },
        }

        sortStage = { _id: 1 }
        break

      case "month":
        // Thống kê theo tháng trong năm
        const statsYear = year ? Number.parseInt(year) : currentYear

        matchStage = {
          date: {
            $gte: new Date(statsYear, 0, 1),
            $lt: new Date(statsYear + 1, 0, 1),
          },
        }

        groupStage = {
          _id: { $month: "$date" },
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          date: { $first: "$date" },
        }

        sortStage = { _id: 1 }
        break

      case "year":
        // Thống kê theo năm
        groupStage = {
          _id: { $year: "$date" },
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          date: { $first: "$date" },
        }

        sortStage = { _id: 1 }
        break

      default:
        return res.json({ success: false, message: "Invalid period" })
    }

    const pipeline = [{ $match: matchStage }, { $group: groupStage }, { $sort: sortStage }]

    const stats = await orderModel.aggregate(pipeline)

    // Format dữ liệu cho frontend
    const formattedStats = stats.map((stat) => ({
      period: stat._id,
      revenue: stat.totalRevenue,
      orders: stat.totalOrders,
      date: stat.date,
    }))

    res.json({
      success: true,
      data: formattedStats,
      period,
      year: year || currentYear,
      month: month || currentMonth,
    })
  } catch (error) {
    console.log("Error getting revenue stats:", error)
    res.json({ success: false, message: "Lỗi khi lấy thống kê doanh thu" })
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

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId })
    res.json({ success: true, data: orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng" })
  }
}

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

    const query = {
      userId,
      $or: [{ status: "Đã giao hàng" }, { status: "Đã giao" }],
    }

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

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const orders = await orderModel.find(query).sort(sortOptions).skip(skip).limit(Number.parseInt(limit)).lean()

    console.log("Found orders:", orders.length)

    const totalOrders = await orderModel.countDocuments(query)
    const totalPages = Math.ceil(totalOrders / Number.parseInt(limit))

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

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  updatePaymentStatus,
  getUserPurchaseHistory,
  getRevenueStats,
}
