import mongoose from "mongoose"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Food Schema (same as your current foodModel)
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "category" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
})

const Food = mongoose.model("food", foodSchema)

// Category Schema
const categorySchema = new mongoose.Schema({
  category_name: { type: String, required: true },
  category_image: { type: String, required: true },
})

const Category = mongoose.model("category", categorySchema)

async function migrateFoodSchema() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://root:123@fastfood.tebr7ko.mongodb.net/fastfood?retryWrites=true&w=majority&appName=FastFood"
    await mongoose.connect(mongoUri)
    console.log("✅ Connected to MongoDB")

    // Get all food documents
    const foods = await Food.find({})
    console.log(`📊 Found ${foods.length} food documents to migrate`)

    let updatedCount = 0
    let skippedCount = 0

    for (const food of foods) {
      let needsUpdate = false
      const updateData = {}

      // Check and add missing fields
      if (!food.categoryId) {
        // Find category by name
        const category = await Category.findOne({
          category_name: { $regex: new RegExp(food.category, "i") },
        })

        if (category) {
          updateData.categoryId = category._id
          needsUpdate = true
        }
      }

      if (!food.createdAt) {
        updateData.createdAt = new Date()
        needsUpdate = true
      }

      if (!food.updatedAt) {
        updateData.updatedAt = new Date()
        needsUpdate = true
      }

      if (food.isActive === undefined) {
        updateData.isActive = true
        needsUpdate = true
      }

      if (food.stock === undefined) {
        updateData.stock = 0
        needsUpdate = true
      }

      if (food.rating === undefined) {
        updateData.rating = 0
        needsUpdate = true
      }

      if (food.reviewCount === undefined) {
        updateData.reviewCount = 0
        needsUpdate = true
      }

      if (needsUpdate) {
        await Food.findByIdAndUpdate(food._id, updateData)
        updatedCount++
        console.log(`✅ Updated: ${food.name}`)
      } else {
        skippedCount++
        console.log(`⏭️  Skipped: ${food.name} (already up to date)`)
      }
    }

    console.log("\n🎉 Migration completed!")
    console.log(`📈 Updated: ${updatedCount} documents`)
    console.log(`⏭️  Skipped: ${skippedCount} documents`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

// Run migration
migrateFoodSchema()
