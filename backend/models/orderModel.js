import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Đang chuẩn bị đồ" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  paymentMethod: { type: String, default: "COD" }, // COD, VNPay, MoMo, ZaloPay, BankTransfer
  paymentStatus: { type: String, default: "Chưa thanh toán" }, // Chưa thanh toán, Đang xử lý, Đã thanh toán, Thanh toán thất bại
  transactionId: { type: String, default: "" },
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)
export default orderModel
