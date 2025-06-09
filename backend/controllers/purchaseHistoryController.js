import purchaseHistoryModel from "../models/purchaseHistoryModel.js"
import orderModel from "../models/orderModel.js"

// Move completed order to purchase history
const moveOrderToPurchaseHistory = async (orderId) => {
  try {
    // Get the completed order
    const order = await orderModel.findById(orderId)
    if (!order) {
      throw new Error("Order not found")
    }

    // Check if already in purchase history
    const existingHistory = await purchaseHistoryModel.findOne({ orderId: orderId })
    if (existingHistory) {
      console.log("Order already in purchase history:", orderId)
      return existingHistory
    }

    // Calculate total item count
    const totalItemCount = order.items.reduce((total, item) => total + item.quantity, 0)

    // Create purchase history record
    const purchaseHistory = new purchaseHistoryModel({
      userId: order.userId,
      orderId: order._id.toString(),
      items: order.items,
      amount: order.amount,
      address: order.address,
      orderDate: order.date,
      completedDate: new Date(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      voucherCode: order.voucherCode,
      discountAmount: order.discountAmount,
      shippingFee: order.shippingFee || 0,
      finalStatus: order.status,
      totalItemCount: totalItemCount,
    })

    await purchaseHistory.save()
    console.log("Order moved to purchase history:", orderId)
    return purchaseHistory
  } catch (error) {
    console.error("Error moving order to purchase history:", error)
    throw error
  }
}

// Get purchase history with advanced filtering
const getPurchaseHistory = async (req, res) => {
  try {
    const userId = req.body.userId
    const {
      page = 1,
      limit = 10,
      status = "all",
      timeRange = "all",
      search = "",
      sortBy = "newest",
      minAmount = 0,
      maxAmount = null,
    } = req.query

    // Build filter object
    const filter = { userId }

    // Amount range filter
    if (minAmount > 0 || maxAmount) {
      filter.amount = {}
      if (minAmount > 0) filter.amount.$gte = Number(minAmount)
      if (maxAmount) filter.amount.$lte = Number(maxAmount)
    }

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date()
      let startDate

      switch (timeRange) {
        case "7days":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
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
        default:
          startDate = null
      }

      if (startDate) {
        filter.completedDate = { $gte: startDate }
      }
    }

    // Search filter
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "address.name": { $regex: search, $options: "i" } },
        { "address.phone": { $regex: search, $options: "i" } },
        { voucherCode: { $regex: search, $options: "i" } },
      ]
    }

    // Sort options
    let sortOptions = {}
    switch (sortBy) {
      case "newest":
        sortOptions = { completedDate: -1 }
        break
      case "oldest":
        sortOptions = { completedDate: 1 }
        break
      case "highest":
        sortOptions = { amount: -1 }
        break
      case "lowest":
        sortOptions = { amount: 1 }
        break
      case "most_items":
        sortOptions = { totalItemCount: -1 }
        break
      default:
        sortOptions = { completedDate: -1 }
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Get purchase history with pagination
    const purchases = await purchaseHistoryModel
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .lean()

    // Get total count for pagination
    const totalPurchases = await purchaseHistoryModel.countDocuments(filter)
    const totalPages = Math.ceil(totalPurchases / Number.parseInt(limit))

    // Calculate statistics
    const stats = await purchaseHistoryModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: "$totalItemCount" },
          avgOrderValue: { $avg: "$amount" },
          totalSavings: { $sum: "$discountAmount" },
        },
      },
    ])

    const statistics =
      stats.length > 0
        ? stats[0]
        : {
            totalSpent: 0,
            totalOrders: 0,
            totalItems: 0,
            avgOrderValue: 0,
            totalSavings: 0,
          }

    // Get monthly spending for the last 12 months
    const monthlyStats = await purchaseHistoryModel.aggregate([
      {
        $match: {
          userId,
          completedDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$completedDate" },
            month: { $month: "$completedDate" },
          },
          totalSpent: { $sum: "$amount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    res.json({
      success: true,
      data: purchases,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalPurchases,
        hasNextPage: Number.parseInt(page) < totalPages,
        hasPrevPage: Number.parseInt(page) > 1,
      },
      statistics,
      monthlyStats,
    })
  } catch (error) {
    console.error("Error getting purchase history:", error)
    res.json({
      success: false,
      message: "Lỗi khi lấy lịch sử mua hàng",
    })
  }
}

// Get purchase statistics
const getPurchaseStatistics = async (req, res) => {
  try {
    const userId = req.body.userId

    // Overall statistics
    const overallStats = await purchaseHistoryModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: "$totalItemCount" },
          avgOrderValue: { $avg: "$amount" },
          totalSavings: { $sum: "$discountAmount" },
          maxOrderValue: { $max: "$amount" },
          minOrderValue: { $min: "$amount" },
        },
      },
    ])

    // Most ordered items
    const topItems = await purchaseHistoryModel.aggregate([
      { $match: { userId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalSpent: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ])

    // Payment method distribution
    const paymentMethods = await purchaseHistoryModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Recent activity (last 30 days)
    const recentActivity = await purchaseHistoryModel.aggregate([
      {
        $match: {
          userId,
          completedDate: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
      {
        $group: {
          _id: null,
          recentSpent: { $sum: "$amount" },
          recentOrders: { $sum: 1 },
        },
      },
    ])

    res.json({
      success: true,
      overallStats: overallStats[0] || {},
      topItems,
      paymentMethods,
      recentActivity: recentActivity[0] || { recentSpent: 0, recentOrders: 0 },
    })
  } catch (error) {
    console.error("Error getting purchase statistics:", error)
    res.json({
      success: false,
      message: "Lỗi khi lấy thống kê mua hàng",
    })
  }
}

// Add rating and review to purchase
const addPurchaseReview = async (req, res) => {
  try {
    const { purchaseId, rating, review } = req.body
    const userId = req.body.userId

    const purchase = await purchaseHistoryModel.findOneAndUpdate(
      { _id: purchaseId, userId },
      {
        customerRating: rating,
        customerReview: review,
      },
      { new: true },
    )

    if (!purchase) {
      return res.json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      })
    }

    res.json({
      success: true,
      message: "Đánh giá đã được lưu",
      data: purchase,
    })
  } catch (error) {
    console.error("Error adding purchase review:", error)
    res.json({
      success: false,
      message: "Lỗi khi thêm đánh giá",
    })
  }
}

export { moveOrderToPurchaseHistory, getPurchaseHistory, getPurchaseStatistics, addPurchaseReview }
