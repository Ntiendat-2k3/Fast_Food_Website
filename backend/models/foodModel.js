import mongoose from "mongoose"

const foodSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: false, 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
})

foodSchema.index({ categoryId: 1 })
foodSchema.index({ category: 1 })
foodSchema.index({ name: "text", description: "text" })
foodSchema.index({ isActive: 1 })

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema)

export default foodModel
