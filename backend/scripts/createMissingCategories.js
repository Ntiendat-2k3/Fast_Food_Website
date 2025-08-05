import mongoose from "mongoose"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Category Schema
const categorySchema = new mongoose.Schema({
  category_name: { type: String, required: true },
  category_image: { type: String, required: true },
})

const Category = mongoose.model("category", categorySchema)

// Food Schema
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
})

const Food = mongoose.model("food", foodSchema)

// Category icons mapping
const categoryIcons = {
  Burger: "🍔",
  Pizza: "🍕",
  Sandwich: "🥪",
  Salad: "🥗",
  Drink: "🥤",
  Dessert: "🍰",
  Chicken: "🍗",
  Noodles: "🍜",
  Rice: "🍚",
  Soup: "🍲",
}

async function createMissingCategories() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://root:123@fastfood.tebr7ko.mongodb.net/fastfood?retryWrites=true&w=majority&appName=FastFood"
    await mongoose.connect(mongoUri)
    console.log("✅ Connected to MongoDB")

    // Get all unique categories from food documents
    const uniqueCategories = await Food.distinct("category")
    console.log(`📊 Found ${uniqueCategories.length} unique categories in food collection:`, uniqueCategories)

    // Get existing categories
    const existingCategories = await Category.find({})
    const existingCategoryNames = existingCategories.map((cat) => cat.category_name.toLowerCase())

    console.log(`📋 Existing categories: ${existingCategoryNames.length}`)

    let createdCount = 0
    let skippedCount = 0

    for (const categoryName of uniqueCategories) {
      // Check if category already exists (case insensitive)
      if (!existingCategoryNames.includes(categoryName.toLowerCase())) {
        // Find appropriate icon
        const icon = categoryIcons[categoryName] || "🍽️" // Default food icon

        // Create new category
        const newCategory = new Category({
          category_name: categoryName,
          category_image: icon,
        })

        await newCategory.save()
        createdCount++
        console.log(`✅ Created category: ${categoryName} ${icon}`)
      } else {
        skippedCount++
        console.log(`⏭️  Category already exists: ${categoryName}`)
      }
    }

    console.log("\n🎉 Category creation completed!")
    console.log(`📈 Created: ${createdCount} new categories`)
    console.log(`⏭️  Skipped: ${skippedCount} existing categories`)

    // Display all categories
    const allCategories = await Category.find({})
    console.log("\n📋 All categories in database:")
    allCategories.forEach((cat) => {
      console.log(`   ${cat.category_image} ${cat.category_name}`)
    })
  } catch (error) {
    console.error("❌ Category creation failed:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

// Run script
createMissingCategories()
