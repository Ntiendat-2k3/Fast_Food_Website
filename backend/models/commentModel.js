import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  userName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  isApproved: { type: Boolean, default: true },
  adminReply: {
    message: { type: String },
    createdAt: { type: Date },
  },
})

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema)
export default commentModel
