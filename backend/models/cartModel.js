import mongoose from "mongoose"

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // One cart per user
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "food",
          required: true,
        },
        name: { type: String, required: true },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
cartSchema.index({ userId: 1 })
cartSchema.index({ "items.foodId": 1 })
cartSchema.index({ updatedAt: 1 })

// Pre-save middleware to calculate total amount
cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((total, item) => total + item.price * item.quantity, 0)
  this.updatedAt = new Date()
  next()
})

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema)

export default cartModel
