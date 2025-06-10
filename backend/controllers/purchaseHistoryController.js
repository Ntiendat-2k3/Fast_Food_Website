import PurchaseHistory from "../models/purchaseHistoryModel.js"
import Order from "../models/orderModel.js"

// Lấy lịch sử mua hàng của người dùng
export const getUserPurchaseHistory = async (req, res) => {
  try {
    const { userId } = req.body
    const { page = 1, limit = 10, sortBy = "newest", search = "", timeRange = "all" } = req.query

    console.log("Getting purchase history for user:", userId)
    console.log("Query params:", { page, limit, sortBy, search, timeRange })

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy ID người dùng",
      })
    }

    // Build query
    const query = { userId }

    // Add search filter
    if (search) {
      query.$or = [
        { "items.name": { $regex: search, $options: "i" } },
        { voucherCode: { $regex: search, $options: "i" } },
        { "deliveryAddress.name": { $regex: search, $options: "i" } },
        { "deliveryAddress.phone": { $regex: search, $options: "i" } },
      ]
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
        query.purchaseDate = { $gte: startDate }
      }
    }

    // Sort options
    let sortOptions = {}
    switch (sortBy) {
      case "newest":
        sortOptions = { purchaseDate: -1 }
        break
      case "oldest":
        sortOptions = { purchaseDate: 1 }
        break
      case "highest":
        sortOptions = { totalAmount: -1 }
        break
      case "lowest":
        sortOptions = { totalAmount: 1 }
        break
      default:
        sortOptions = { purchaseDate: -1 }
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Execute query
    const purchases = await PurchaseHistory.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .lean()

    const totalPurchases = await PurchaseHistory.countDocuments(query)
    const totalPages = Math.ceil(totalPurchases / Number.parseInt(limit))

    // Calculate statistics
    const allPurchases = await PurchaseHistory.find({ userId })
    const totalSpent = allPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
    const totalItems = allPurchases.reduce((sum, purchase) => {
      return sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)

    res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        totalPages,
        currentPage: Number.parseInt(page),
        totalItems: totalPurchases,
      },
      stats: {
        totalSpent,
        totalOrders: allPurchases.length,
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

// Thêm vào lịch sử mua hàng khi đơn hàng hoàn thành
export const addToPurchaseHistory = async (req, res) => {
  try {
    const { orderId } = req.body

    // Kiểm tra xem đơn hàng đã tồn tại trong lịch sử chưa
    const existingRecord = await PurchaseHistory.findOne({ orderId })
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng này đã được thêm vào lịch sử mua hàng",
      })
    }

    // Lấy thông tin đơn hàng
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      })
    }

    // Chỉ thêm vào lịch sử nếu đơn hàng đã hoàn thành
    if (order.status !== "Đã giao hàng" && order.status !== "Đã giao") {
      return res.status(400).json({
        success: false,
        message: "Chỉ đơn hàng đã hoàn thành mới được thêm vào lịch sử mua hàng",
      })
    }

    // Tạo bản ghi lịch sử mua hàng
    const purchaseHistory = new PurchaseHistory({
      userId: order.userId,
      orderId: order._id,
      items: order.items,
      totalAmount: order.amount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.address,
      purchaseDate: order.date,
      voucherCode: order.voucherCode,
      discountAmount: order.discountAmount,
    })

    await purchaseHistory.save()

    res.status(201).json({
      success: true,
      message: "Đã thêm vào lịch sử mua hàng",
      data: purchaseHistory,
    })
  } catch (error) {
    console.error("Error adding to purchase history:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm vào lịch sử mua hàng",
      error: error.message,
    })
  }
}

// Tự động thêm vào lịch sử mua hàng khi cập nhật trạng thái đơn hàng thành "Đã giao hàng"
export const autoAddToPurchaseHistory = async (orderId) => {
  try {
    // Kiểm tra xem đơn hàng đã tồn tại trong lịch sử chưa
    const existingRecord = await PurchaseHistory.findOne({ orderId })
    if (existingRecord) {
      console.log("Đơn hàng đã tồn tại trong lịch sử mua hàng")
      return
    }

    // Lấy thông tin đơn hàng
    const order = await Order.findById(orderId)
    if (!order) {
      console.log("Không tìm thấy đơn hàng")
      return
    }

    // Tạo bản ghi lịch sử mua hàng
    const purchaseHistory = new PurchaseHistory({
      userId: order.userId,
      orderId: order._id,
      items: order.items,
      totalAmount: order.amount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.address,
      purchaseDate: order.date,
      voucherCode: order.voucherCode,
      discountAmount: order.discountAmount,
    })

    await purchaseHistory.save()
    console.log("Đã tự động thêm đơn hàng vào lịch sử mua hàng")
  } catch (error) {
    console.error("Error auto adding to purchase history:", error)
  }
}

// Xóa lịch sử mua hàng (chỉ admin)
export const deletePurchaseHistory = async (req, res) => {
  try {
    const { id } = req.params

    const result = await PurchaseHistory.findByIdAndDelete(id)
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi lịch sử mua hàng",
      })
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa bản ghi lịch sử mua hàng",
    })
  } catch (error) {
    console.error("Error deleting purchase history:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lịch sử mua hàng",
      error: error.message,
    })
  }
}

// Lấy chi tiết một bản ghi lịch sử mua hàng
export const getPurchaseHistoryDetail = async (req, res) => {
  try {
    const { id } = req.params

    const purchase = await PurchaseHistory.findById(id).lean()
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bản ghi lịch sử mua hàng",
      })
    }

    res.status(200).json({
      success: true,
      data: purchase,
    })
  } catch (error) {
    console.error("Error getting purchase history detail:", error)
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết lịch sử mua hàng",
      error: error.message,
    })
  }
}
