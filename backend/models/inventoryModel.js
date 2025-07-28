import mongoose from "mongoose"

const inventorySchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "food",
    required: true,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 50,
    min: 0,
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 1,
  },
  status: {
    type: String,
    enum: ["in_stock", "low_stock", "out_of_stock"],
    default: "in_stock",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    default: "admin",
  },
})

// Pre-save middleware to automatically calculate status
inventorySchema.pre("save", function (next) {
  if (this.quantity === 0) {
    this.status = "out_of_stock"
  } else if (this.quantity <= 20) {
    this.status = "low_stock"
  } else {
    this.status = "in_stock"
  }
  this.lastUpdated = new Date()
  next()
})

const inventoryModel = mongoose.model("inventory", inventorySchema)

export default inventoryModel
