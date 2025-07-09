import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["info", "warning", "success", "error", "order", "payment", "system", "user"],
    default: "info",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  read: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdBy: { type: String },
  targetUser: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema)

export default notificationModel
