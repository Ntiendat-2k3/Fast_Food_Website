import mongoose from "mongoose"

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "food", required: true },
  createdAt: { type: Date, default: Date.now },
})

// Tạo index để tránh duplicate
wishlistSchema.index({ userId: 1, foodId: 1 }, { unique: true })

const wishlistModel = mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema)

export default wishlistModel
