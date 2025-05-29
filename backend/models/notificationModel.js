import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "success", "error"], default: "info" },
  targetUser: { type: String, default: "all" }, // "all" or specific user ID
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
})

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema)
export default notificationModel
