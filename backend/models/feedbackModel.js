import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "replied"], default: "pending" },
  reply: {
    message: { type: String },
    createdAt: { type: Date },
  },
})

const feedbackModel = mongoose.models.feedback || mongoose.model("feedback", feedbackSchema)
export default feedbackModel
