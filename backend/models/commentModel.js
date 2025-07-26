import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
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
    userName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["rating", "comment"],
      default: "rating",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    adminReply: {
      type: String,
    },
    adminReplyAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for userId, foodId, and type to allow one rating and one comment per user per food
commentSchema.index({ userId: 1, foodId: 1, type: 1 }, { unique: true })

// Function to update indexes
const updateIndexes = async () => {
  try {
    const Comment = mongoose.model("comment", commentSchema)

    // Drop old index if it exists
    try {
      await Comment.collection.dropIndex("userId_1_foodId_1")
      console.log("Dropped old index: userId_1_foodId_1")
    } catch (error) {
      // Index might not exist, that's okay
      console.log("Old index userId_1_foodId_1 not found or already dropped")
    }

    // Ensure new index exists
    await Comment.collection.createIndex({ userId: 1, foodId: 1, type: 1 }, { unique: true })
    console.log("Created new index: userId_1_foodId_1_type_1")

    // Update existing documents to have type field
    const result = await Comment.updateMany({ type: { $exists: false } }, { $set: { type: "rating" } })
    console.log(`Updated ${result.modifiedCount} documents with type field`)
  } catch (error) {
    console.error("Error updating indexes:", error)
  }
}

// Update indexes when model is loaded
mongoose.connection.once("open", () => {
  updateIndexes()
})

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema)

export default commentModel
