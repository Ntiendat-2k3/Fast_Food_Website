import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "warning", "success", "order", "order_cancelled"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null, // null for system-wide notifications
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      default: null,
    },
    createdBy: {
      type: String,
      default: "admin",
      required: true,
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    // Chỉ giữ một field cho trạng thái đọc
    isRead: { type: Boolean, default: false },
    // Metadata cho notification
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ type: 1 })
notificationSchema.index({ isRead: 1 })
notificationSchema.index({ orderId: 1 })
notificationSchema.index({ createdBy: 1 })

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema)

export default notificationModel
