import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["order", "payment", "system", "user"],
    default: "system",
  },
  orderId: { type: String, default: null },
  userId: { type: String, default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date, default: null },
})

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema)

export default notificationModel
