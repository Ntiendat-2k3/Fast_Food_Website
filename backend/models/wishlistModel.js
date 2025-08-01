import mongoose from "mongoose"

const wishlistSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  },
)

// Create compound index to ensure a user can't add the same food item twice
wishlistSchema.index({ userId: 1, foodId: 1 }, { unique: true })

// Create individual indexes for better query performance
wishlistSchema.index({ userId: 1 })
wishlistSchema.index({ foodId: 1 })

const wishlistModel = mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema)

export default wishlistModel
