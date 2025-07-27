import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Đang xử lý" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  paymentMethod: { type: String, default: "COD" },
  paymentStatus: { type: String, default: "Chưa thanh toán" },
  voucherCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 14000 },
  deliveryFee: { type: Number, default: 14000 },
  distance: { type: Number, default: null },
  subtotal: { type: Number, default: 0 },
  itemsTotal: { type: Number, default: 0 },
  customerConfirmed: { type: Boolean, default: false },
  customerConfirmedAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  // Thêm các field cho việc hủy đơn hàng
  cancelReason: { type: String, default: null },
  cancelledBy: { type: String, default: null }, // 'customer' hoặc 'admin'
  cancelledAt: { type: Date, default: null },
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel
