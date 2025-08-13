import mongoose from "mongoose"

const foodSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
})

// Virtual field for category name (for backward compatibility)
foodSchema.virtual("category", {
  ref: "category",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
})

// Ensure virtual fields are serialized
foodSchema.set("toJSON", { virtuals: true })
foodSchema.set("toObject", { virtuals: true })

foodSchema.index({ categoryId: 1 })
foodSchema.index({ name: "text", description: "text" })
foodSchema.index({ isActive: 1 })

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema)

export default foodModel
