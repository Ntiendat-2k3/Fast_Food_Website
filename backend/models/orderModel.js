import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: "Đang xử lý",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    default: "COD",
  },
  paymentStatus: {
    type: String,
    default: "Chưa thanh toán",
  },
  voucherCode: {
    type: String,
    default: null,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  transactionId: {
    type: String,
    default: "",
  },
})

const orderModel = mongoose.models.order || mongoose.model("orders", orderSchema)
export default orderModel
