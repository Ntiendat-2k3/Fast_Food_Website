import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

// placing user order from frontend
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      date: new Date(), // Đảm bảo đặt ngày đúng
      paymentMethod: req.body.paymentMethod || "COD", // Phương thức thanh toán
      paymentStatus: req.body.paymentMethod === "COD" ? "Chưa thanh toán" : "Đang xử lý",
    })
    await newOrder.save()
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })

    // Trả về thông tin đơn hàng
    res.json({
      success: true,
      message: "Đặt hàng thành công",
      orderId: newOrder._id,
      redirectUrl:
        req.body.paymentMethod === "COD" ? "/thankyou" : `/payment/${req.body.paymentMethod}/${newOrder._id}`,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi đặt hàng" })
  }
}

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
    res.json({ success: true, data: orders })
  } catch (error) {
    console.log(error)
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

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, updatePaymentStatus }
