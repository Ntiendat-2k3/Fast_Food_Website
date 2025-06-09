import mongoose from "mongoose"

const purchaseHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Index for faster queries
    },
    orderId: {
      type: String,
      required: true,
      unique: true, // Ensure no duplicate orders
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
    orderDate: {
      type: Date,
      required: true,
    },
    completedDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "Đã thanh toán",
    },
    voucherCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    finalStatus: {
      type: String,
      default: "Đã giao hàng",
    },
    deliveryTime: {
      type: Number, // Time in minutes from order to delivery
      default: null,
    },
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    customerReview: {
      type: String,
      default: null,
    },
    // Additional analytics fields
    orderSource: {
      type: String, // web, mobile, etc.
      default: "web",
    },
    totalItemCount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
)

// Indexes for better query performance
purchaseHistorySchema.index({ userId: 1, completedDate: -1 })
purchaseHistorySchema.index({ userId: 1, amount: -1 })
purchaseHistorySchema.index({ completedDate: -1 })
purchaseHistorySchema.index({ "address.name": "text", "address.phone": "text" })

const purchaseHistoryModel = mongoose.models.purchaseHistory || mongoose.model("purchaseHistory", purchaseHistorySchema)
export default purchaseHistoryModel
