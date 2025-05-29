import mongoose from "mongoose"

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, required: true, enum: ["percentage", "fixed"] }, // Loại giảm giá: phần trăm hoặc cố định
  discountValue: { type: Number, required: true }, // Giá trị giảm giá
  minOrderValue: { type: Number, default: 0 }, // Giá trị đơn hàng tối thiểu để áp dụng
  maxDiscountAmount: { type: Number }, // Giảm tối đa (cho loại phần trăm)
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 0 }, // 0 = không giới hạn
  usageCount: { type: Number, default: 0 }, // Số lần đã sử dụng
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const voucherModel = mongoose.models.voucher || mongoose.model("voucher", voucherSchema)
export default voucherModel
