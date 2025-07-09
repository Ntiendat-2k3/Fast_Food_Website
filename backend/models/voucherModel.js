import mongoose from "mongoose"

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 means unlimited
      min: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
voucherSchema.index({ code: 1 })
voucherSchema.index({ isActive: 1, startDate: 1, endDate: 1 })

// Validate that end date is after start date
voucherSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("Ngày kết thúc phải sau ngày bắt đầu"))
  }
  next()
})

// Validate discount value based on type
voucherSchema.pre("save", function (next) {
  if (this.discountType === "percentage" && this.discountValue > 100) {
    next(new Error("Giá trị phần trăm không được vượt quá 100%"))
  }
  next()
})

const voucherModel = mongoose.models.voucher || mongoose.model("voucher", voucherSchema)

export default voucherModel
