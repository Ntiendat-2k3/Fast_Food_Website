import orderModel from "../models/orderModel" // Declare the orderModel variable

// Lấy lịch sử mua hàng của người dùng
export const getUserPurchaseHistory = async (req, res) => {
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
