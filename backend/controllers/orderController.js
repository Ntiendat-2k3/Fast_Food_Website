import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import notificationModel from "../models/notificationModel.js"
import PDFDocument from "pdfkit"
import path from "path"
import { fileURLToPath } from "url"

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
      status: "Đang xử lý", // Set initial status
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
      customerConfirmed: false,
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

// Export invoice as PDF
const exportInvoice = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await orderModel.findById(orderId)

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" })
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 })

    // Register font for Vietnamese characters
    // Make sure 'Roboto-Regular.ttf' is in backend/fonts/
    try {
      doc.registerFont("Roboto", path.join(__dirname, "../fonts/Roboto-Regular.ttf"))
      doc.registerFont("Roboto-Bold", path.join(__dirname, "../fonts/Roboto-Bold.ttf"))
    } catch (fontError) {
      console.error("Error registering font:", fontError)
      doc.font("Helvetica")
    }

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${order._id}.pdf`)

    doc.pipe(res)

    // Helper function to format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
    }

    // Helper function to format date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    // Set default font for the document
    doc.font("Roboto")

    // Shop Name Header
    doc.fontSize(28).fillColor("#FFD700").text("GreenEats", { align: "center" })
    doc.fontSize(10).fillColor("#333").text("Món ngon giao tận nơi!", { align: "center" }) // Changed to darker gray
    doc.moveDown(1.5)

    // Invoice Title
    doc.fontSize(22).fillColor("#000").text("HÓA ĐƠN THANH TOÁN", { align: "center" }) // Changed to black
    doc.moveDown(1.5)

    // Order Details Header
    doc.fontSize(12).fillColor("#555").text(`Mã đơn hàng: `, { continued: true }) // Changed to darker gray
    doc.fillColor("#000").text(`#${order._id.toString().slice(-8).toUpperCase()}`) // Changed to black
    doc.fillColor("#555").text(`Ngày đặt hàng: `, { continued: true }) // Changed to darker gray
    doc.fillColor("#000").text(`${formatDate(order.date)}`) // Changed to black
    doc.moveDown(1)

    // Customer Information Section
    doc.fillColor("#FFD700").fontSize(16).text("Thông tin khách hàng:", { underline: true })
    doc.moveDown(0.5)
    doc.fillColor("#333").fontSize(12) // Changed to darker gray
    doc.text(`Tên khách hàng: ${order.address.name}`)
    doc.text(`Số điện thoại: ${order.address.phone}`)
    doc.text(
      `Địa chỉ: ${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`,
    )
    doc.moveDown(1.5)

    // Order Items Table
    doc.fillColor("#FFD700").fontSize(16).text("Chi tiết đơn hàng:", { underline: true })
    doc.moveDown(0.5)

    const tableHeaders = ["Sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"]
    const columnWidths = [200, 80, 100, 100]
    const startX = 50
    let currentY = doc.y

    // Draw table header
    doc.font("Roboto-Bold").fillColor("#000").fontSize(12) // Changed to black
    tableHeaders.forEach((header, i) => {
      doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY, {
        width: columnWidths[i],
        align: i === 1 || i === 2 || i === 3 ? "right" : "left", // Align quantity, price, total right
      })
    })
    doc.moveDown(0.5)
    doc
      .strokeColor("#555")
      .lineWidth(0.5)
      .moveTo(startX, doc.y)
      .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), doc.y)
      .stroke()
    doc.moveDown(0.5)

    // Draw table rows
    doc.font("Roboto").fillColor("#333").fontSize(11) // Changed to darker gray
    order.items.forEach((item) => {
      currentY = doc.y
      doc.text(item.name, startX, currentY, { width: columnWidths[0] })
      doc.text(item.quantity.toString(), startX + columnWidths[0], currentY, { width: columnWidths[1], align: "right" })
      doc.text(formatCurrency(item.price), startX + columnWidths[0] + columnWidths[1], currentY, {
        width: columnWidths[2],
        align: "right",
      })
      doc.text(
        formatCurrency(item.price * item.quantity),
        startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
        currentY,
        { width: columnWidths[3], align: "right" },
      )
      doc.moveDown(0.7)
    })
    doc.moveDown(1)

    // Summary Section
    doc.fillColor("#333").fontSize(12) // Changed to darker gray
    doc.text(`Tổng phụ: ${formatCurrency(order.itemsTotal || order.subtotal)}`, { align: "right" })
    doc.text(`Phí vận chuyển: ${formatCurrency(order.shippingFee || order.deliveryFee)}`, { align: "right" })
    if (order.voucherCode) {
      doc.text(`Mã giảm giá (${order.voucherCode}): -${formatCurrency(order.discountAmount)}`, { align: "right" })
    }
    doc.moveDown(0.5)
    doc
      .strokeColor("#555")
      .lineWidth(1)
      .moveTo(startX + 300, doc.y)
      .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), doc.y)
      .stroke()
    doc.moveDown(0.5)
    doc
      .fontSize(16)
      .fillColor("#FFD700")
      .text(`TỔNG CỘNG: ${formatCurrency(order.amount)}`, { align: "right" })
    doc.moveDown(1.5)

    // Payment Information
    doc.fillColor("#555").fontSize(12).text(`Phương thức thanh toán: `, { continued: true }) // Changed to darker gray
    doc.fillColor("#000").text(`${order.paymentMethod}`) // Changed to black
    doc.fillColor("#555").text(`Trạng thái thanh toán: `, { continued: true }) // Changed to darker gray
    doc.fillColor("#000").text(`${order.paymentStatus}`) // Changed to black
    doc.moveDown(2)

    // Footer
    doc.fillColor("#555").fontSize(10).text("Cảm ơn quý khách đã đặt hàng tại GreenEats!", { align: "center" }) // Changed to darker gray
    doc.text("Hẹn gặp lại quý khách!", { align: "center" })
    doc.moveDown(0.5)
    doc.text("Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM", { align: "center" })
    doc.text("Điện thoại: 0123 456 789 | Email: contact@greeneats.com", { align: "center" })

    doc.end()
  } catch (error) {
    console.error("Error exporting invoice:", error)
    res.status(500).json({ success: false, message: "Lỗi khi xuất hóa đơn" })
  }
}

// Khách hàng xác nhận đã nhận hàng
const confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.body
    const userId = req.body.userId

    console.log("Confirm delivery request:", { orderId, userId })

    // Tìm đơn hàng và kiểm tra quyền
    const order = await orderModel.findById(orderId)

    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" })
    }

    if (order.userId !== userId) {
      return res.json({ success: false, message: "Không có quyền thực hiện thao tác này" })
    }

    if (order.status !== "Đã giao") {
      return res.json({ success: false, message: "Đơn hàng chưa được giao" })
    }

    if (order.customerConfirmed) {
      return res.json({ success: false, message: "Đơn hàng đã được xác nhận trước đó" })
    }

    // Cập nhật trạng thái đơn hàng
    await orderModel.findByIdAndUpdate(orderId, {
      status: "Đã hoàn thành",
      customerConfirmed: true,
      customerConfirmedAt: new Date(),
      paymentStatus: "Đã thanh toán",
    })

    console.log("Order confirmed successfully:", orderId)

    res.json({ success: true, message: "Xác nhận nhận hàng thành công" })
  } catch (error) {
    console.log("Error confirming delivery:", error)
    res.json({ success: false, message: "Lỗi khi xác nhận nhận hàng" })
  }
}

// Tự động hoàn thành đơn hàng sau 1 ngày
const autoCompleteOrders = async () => {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    // Tìm các đơn hàng đã giao hơn 1 ngày và chưa được khách hàng xác nhận
    const ordersToComplete = await orderModel.find({
      status: "Đã giao",
      deliveredAt: { $lte: oneDayAgo },
      customerConfirmed: false,
    })

    console.log(`Found ${ordersToComplete.length} orders to auto-complete`)

    // Cập nhật trạng thái thành "Đã hoàn thành"
    for (const order of ordersToComplete) {
      await orderModel.findByIdAndUpdate(order._id, {
        status: "Đã hoàn thành",
        paymentStatus: "Đã thanh toán",
      })
      console.log(`Auto-completed order: ${order._id}`)
    }

    return ordersToComplete.length
  } catch (error) {
    console.error("Error auto-completing orders:", error)
    return 0
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
    const userId = req.body.userId
    console.log("Fetching orders for user:", userId)

    if (!userId) {
      return res.json({ success: false, message: "Không tìm thấy ID người dùng" })
    }

    const orders = await orderModel.find({ userId: userId }).sort({ date: -1 })
    console.log(`Found ${orders.length} orders for user ${userId}`)

    res.json({ success: true, data: orders })
  } catch (error) {
    console.log("Error in userOrders:", error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách đơn hàng" })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body

    // Lấy thông tin đơn hàng hiện tại
    const currentOrder = await orderModel.findById(orderId)
    if (!currentOrder) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" })
    }

    // Kiểm tra logic hủy đơn hàng
    if (status === "Đã hủy") {
      if (currentOrder.status !== "Đang xử lý" && currentOrder.status !== "Đang giao hàng") {
        return res.json({
          success: false,
          message: "Chỉ có thể hủy đơn hàng khi đang xử lý hoặc đang giao hàng",
        })
      }
    }

    // Tạo object update với status mới
    const updateData = { status: status }

    // Nếu status là "Đã giao", lưu thời gian giao hàng
    if (status === "Đã giao") {
      updateData.deliveredAt = new Date()
    }

    // Nếu status là "Đã hoàn thành", tự động cập nhật paymentStatus thành "Đã thanh toán"
    if (status === "Đã hoàn thành") {
      updateData.paymentStatus = "Đã thanh toán"
    }

    // Cập nhật đơn hàng
    await orderModel.findByIdAndUpdate(orderId, updateData)

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
      $or: [{ status: "Đã giao hàng" }, { status: "Đã giao" }, { status: "Đã hoàn thành" }],
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
      $or: [{ status: "Đã giao hàng" }, { status: "Đã giao" }, { status: "Đã hoàn thành" }],
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
  exportInvoice,
  confirmDelivery,
  autoCompleteOrders,
}
