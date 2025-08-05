import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "food",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "Nội dung đánh giá phải có ít nhất 10 ký tự"],
    maxlength: [500, "Nội dung đánh giá không được vượt quá 500 ký tự"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Compound index để đảm bảo user chỉ có thể rating một lần cho mỗi sản phẩm
commentSchema.index({ userId: 1, foodId: 1 }, { unique: true })

// Indexes for performance
commentSchema.index({ foodId: 1, createdAt: -1 })
commentSchema.index({ userId: 1 })
commentSchema.index({ rating: 1 })

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema)

export default commentModel
