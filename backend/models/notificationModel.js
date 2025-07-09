import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["info", "warning", "success", "error", "order", "payment", "system", "user"],
    default: "info",
  },
  orderId: { type: String, default: null },
  userId: { type: String, default: null },
  createdBy: { type: String, default: null },
  targetUser: { type: String, default: null },
  read: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date, default: null },
})

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema)

export default notificationModel
