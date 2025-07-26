import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
  rating: { type: Number, min: 1, max: 5 }, // Chỉ có khi type = 'rating'
  comment: { type: String, default: "Đánh giá sao" },
  userName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: true },
  adminReply: { type: String },
  adminReplyAt: { type: Date },
  type: { type: String, enum: ["rating", "comment"], default: "rating" },
})

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema)
export default commentModel
