import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Add indexes for better performance
categorySchema.index({ name: 1 })
categorySchema.index({ isActive: 1 })
categorySchema.index({ order: 1 })

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema)

export default categoryModel
