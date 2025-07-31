import mongoose from "mongoose"

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [
    {
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "food",
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes
wishlistSchema.index({ userId: 1 })
wishlistSchema.index({ "items.foodId": 1 })

// Ensure unique combination of userId and foodId
wishlistSchema.index({ userId: 1, "items.foodId": 1 }, { unique: true })

const wishlistModel = mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema)

export default wishlistModel
