import foodModel from "../models/foodModel.js"
import orderModel from "../models/orderModel.js"
import categoryModel from "../models/categoryModel.js"
import fs from "fs"

// add food item
const addFood = async (req, res) => {
  try {
    const image_filename = `${req.file.filename}`

    // Find category by name to get ObjectId
    const category = await categoryModel.findOne({ name: req.body.category })

    if (!category) {
      return res.json({ success: false, message: "Category not found" })
    }

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category, // Keep string for backward compatibility
      categoryId: category._id, // Required ObjectId reference
      image: image_filename,
    })

    await food.save()
    res.json({ success: true, message: "Food Added" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// all food list with proper population
const listFood = async (req, res) => {
  try {
    const { category } = req.query
    const query = {}

    if (category) {
      // Try to find by category name first, then by ObjectId
      const categoryDoc = await categoryModel.findOne({ name: category })
      if (categoryDoc) {
        query.$or = [{ category: category }, { categoryId: categoryDoc._id }]
      } else {
        query.category = category
      }
    }

    const foods = await foodModel
      .find(query)
      .populate("categoryId", "name icon description isActive")
      .sort({ createdAt: -1 })

    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// search food with category population
const searchFood = async (req, res) => {
  try {
    const keyword = req.query.keyword
    const foods = await foodModel
      .find({
        $or: [{ name: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }],
      })
      .populate("categoryId", "name icon description")

    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Get food by ID with category details
const getFoodById = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.id).populate("categoryId", "name icon description isActive")

    if (!food) {
      return res.json({ success: false, message: "Food not found" })
    }

    res.json({ success: true, data: food })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Get food by category with proper lookup
const getFoodByCategory = async (req, res) => {
  try {
    const { category } = req.params

    // Try to find by category name first, then by categoryId
    let foods
    const categoryDoc = await categoryModel.findOne({ name: category })

    if (categoryDoc) {
      foods = await foodModel
        .find({
          $or: [{ category: category }, { categoryId: categoryDoc._id }],
          isActive: true,
        })
        .populate("categoryId", "name icon description")
        .sort({ createdAt: -1 })
    } else {
      foods = await foodModel
        .find({ category: category, isActive: true })
        .populate("categoryId", "name icon description")
        .sort({ createdAt: -1 })
    }

    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Get sales count for a specific food item
const getFoodSalesCount = async (req, res) => {
  try {
    const { foodId } = req.params

    // Find the food item first to get its name
    const food = await foodModel.findById(foodId)
    if (!food) {
      return res.json({ success: false, message: "Food not found" })
    }

    // Count total quantity sold from all completed orders
    const salesData = await orderModel.aggregate([
      {
        $match: {
          status: { $in: ["Food Processing", "Out for delivery", "Delivered"] }, // Only count confirmed orders
        },
      },
      {
        $unwind: "$items",
      },
      {
        $match: {
          "items.name": food.name,
        },
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$items.quantity" },
        },
      },
    ])

    const totalSold = salesData.length > 0 ? salesData[0].totalSold : 0

    res.json({
      success: true,
      data: {
        foodId: foodId,
        foodName: food.name,
        totalSold: totalSold,
      },
    })
  } catch (error) {
    console.error("Error getting food sales count:", error)
    res.json({ success: false, message: "Error getting sales data" })
  }
}

// Debug endpoint to check data structure
const debugSuggestedDrinks = async (req, res) => {
  try {
    const { category } = req.params

    const categoryFoods = await foodModel.find({ category: category })
    const categoryFoodNames = categoryFoods.map((food) => food.name)

    const ordersWithCategory = await orderModel.find({
      "items.name": { $in: categoryFoodNames },
    })

    const allDrinks = await foodModel.find({ category: "Đồ uống" })
    const drinkNames = allDrinks.map((drink) => drink.name)

    const drinkCount = {}
    const orderAnalysis = []

    ordersWithCategory.forEach((order) => {
      const orderItems = {
        orderId: order._id,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          isDrink: drinkNames.includes(item.name),
          isCategoryItem: categoryFoodNames.includes(item.name),
        })),
      }
      orderAnalysis.push(orderItems)

      order.items.forEach((item) => {
        if (drinkNames.includes(item.name)) {
          drinkCount[item.name] = (drinkCount[item.name] || 0) + (item.quantity || 1)
        }
      })
    })

    res.json({
      success: true,
      debug: {
        targetCategory: category,
        categoryFoods: categoryFoods.length,
        categoryFoodNames,
        ordersFound: ordersWithCategory.length,
        availableDrinks: drinkNames,
        drinkCounts: drinkCount,
        orderAnalysis: orderAnalysis.slice(0, 3), // Show first 3 orders for debugging
      },
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    res.json({ success: false, message: "Debug error" })
  }
}

// Get suggested drinks based on category popularity - FIXED LOGIC
const getSuggestedDrinks = async (req, res) => {
  try {
    const { category } = req.params

    // console.log(`🔍 Getting suggested drinks for category: ${category}`)

    // Get all available categories for debugging
    const allCategories = await foodModel.distinct("category")
    // console.log("📂 Available categories:", allCategories)

    // Find all foods in the specified category
    const categoryFoods = await foodModel.find({ category: category })
    // console.log(`🍔 Found ${categoryFoods.length} foods in category "${category}"`)

    if (categoryFoods.length === 0) {
      return res.json({
        success: false,
        message: `Không tìm thấy sản phẩm nào trong danh mục "${category}"`,
        availableCategories: allCategories,
      })
    }

    const categoryFoodNames = categoryFoods.map((food) => food.name)
    // console.log("📝 Category food names:", categoryFoodNames)

    // Find orders that contain items from this category
    const ordersWithCategory = await orderModel.find({
      "items.name": { $in: categoryFoodNames },
    })

    // console.log(`📦 Found ${ordersWithCategory.length} orders with ${category} items`)

    if (ordersWithCategory.length === 0) {
      // Fallback: return random drinks
      const randomDrinks = await foodModel.find({ category: "Đồ uống" }).limit(4)
      return res.json({
        success: true,
        data: randomDrinks,
        message: "Không có dữ liệu lịch sử, hiển thị đồ uống ngẫu nhiên",
      })
    }

    // Get all actual drinks from database
    const allDrinks = await foodModel.find({ category: "Đồ uống" })
    const drinkNames = allDrinks.map((drink) => drink.name)
    // console.log("🥤 Available drinks:", drinkNames)

    // Count drink occurrences in orders that contain the target category
    const drinkCount = {}

    ordersWithCategory.forEach((order) => {
      order.items.forEach((item) => {
        // Only count if the item is actually a drink (exists in drinks category)
        if (drinkNames.includes(item.name)) {
          drinkCount[item.name] = (drinkCount[item.name] || 0) + (item.quantity || 1)
        }
      })
    })

    // console.log("🥤 Drink counts:", drinkCount)

    // Get the actual drink objects and add purchase count
    const suggestedDrinks = allDrinks
      .filter((drink) => drinkCount[drink.name] > 0)
      .map((drink) => ({
        ...drink.toObject(),
        purchaseCount: drinkCount[drink.name] || 0,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 6) // Limit to top 6

    // console.log(`✅ Returning ${suggestedDrinks.length} suggested drinks`)

    // If no drinks found based on history, return random drinks
    if (suggestedDrinks.length === 0) {
      const randomDrinks = await foodModel.find({ category: "Đồ uống" }).limit(4)
      return res.json({
        success: true,
        data: randomDrinks,
        message: "Không tìm thấy đồ uống phù hợp, hiển thị đồ uống ngẫu nhiên",
      })
    }

    res.json({ success: true, data: suggestedDrinks })
  } catch (error) {
    console.error("❌ Error in getSuggestedDrinks:", error)
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý đồ uống" })
  }
}

// Get suggested foods based on drink name - FIXED LOGIC WITH FLEXIBLE SEARCH
const getSuggestedFoods = async (req, res) => {
  try {
    const { drinkName } = req.params

    // console.log(`🔍 Getting suggested foods for drink: ${drinkName}`)

    // First, get all available categories to understand the data structure
    const allCategories = await foodModel.distinct("category")
    // console.log("📂 All available categories:", allCategories)

    // Try to find the drink with flexible search (case insensitive, partial match)
    let drink = await foodModel.findOne({
      name: { $regex: new RegExp(`^${drinkName}$`, "i") },
    })

    // If exact match not found, try partial match
    if (!drink) {
      drink = await foodModel.findOne({
        name: { $regex: drinkName, $options: "i" },
      })
    }

    // If still not found, try to find any drink that contains the search term
    if (!drink) {
      const possibleDrinks = await foodModel.find({
        category: "Đồ uống",
        name: { $regex: drinkName, $options: "i" },
      })
      // console.log(
      //   // `🔍 Found ${possibleDrinks.length} possible drinks:`,
      //   possibleDrinks.map((d) => d.name),
      // )
      if (possibleDrinks.length > 0) {
        drink = possibleDrinks[0] // Take the first match
      }
    }

    // console.log(`🥤 Drink search result:`, drink ? `Found "${drink.name}" in category: ${drink.category}` : "Not found")

    // Find orders that contain this drink name (use the original search term from orders)
    const ordersWithDrink = await orderModel.find({
      "items.name": { $regex: drinkName, $options: "i" },
    })

    // console.log(`📦 Found ${ordersWithDrink.length} orders with drink pattern "${drinkName}"`)

    // Get sample order items for debugging
    if (ordersWithDrink.length > 0) {
      const sampleOrder = ordersWithDrink[0]
      // console.log(
      //   `📋 Sample order items:`,
      //   sampleOrder.items.map((item) => item.name),
      // )
    }

    if (ordersWithDrink.length === 0) {
      // Fallback: return random foods (exclude drinks categories)
      const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
      const randomFoods = await foodModel
        .find({
          category: { $nin: drinkCategories },
        })
        .limit(4)

      // console.log(`🔄 Fallback: returning ${randomFoods.length} random foods`)
      return res.json({
        success: true,
        data: randomFoods,
        message: "Không có dữ liệu lịch sử, hiển thị món ăn ngẫu nhiên",
      })
    }

    // Get all foods (excluding drink categories) from database
    const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
    const allFoods = await foodModel.find({
      category: { $nin: drinkCategories },
    })

    // console.log(`🍔 Found ${allFoods.length} foods (excluding drinks)`)

    // Create a map of food names for quick lookup
    const foodNamesSet = new Set(allFoods.map((food) => food.name))

    // Count food occurrences in orders that contain the target drink
    const foodCount = {}

    ordersWithDrink.forEach((order) => {
      // console.log(`📋 Processing order ${order._id} with ${order.items.length} items`)

      order.items.forEach((item) => {
        // Only count if the item is actually a food (not the drink itself and exists in foods)
        const isDrinkItem = item.name.toLowerCase().includes(drinkName.toLowerCase())
        if (foodNamesSet.has(item.name) && !isDrinkItem) {
          foodCount[item.name] = (foodCount[item.name] || 0) + (item.quantity || 1)
          // console.log(`  ➕ Added ${item.quantity || 1} of "${item.name}" (total: ${foodCount[item.name]})`)
        }
      })
    })

    // console.log("🍔 Final food counts:", foodCount)

    // Get the actual food objects and add purchase count
    const suggestedFoods = allFoods
      .filter((food) => foodCount[food.name] > 0)
      .map((food) => ({
        ...food.toObject(),
        purchaseCount: foodCount[food.name] || 0,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 6) // Limit to top 6

    // console.log(`✅ Returning ${suggestedFoods.length} suggested foods`)

    // If no foods found based on history, return random foods
    if (suggestedFoods.length === 0) {
      const randomFoods = await foodModel
        .find({
          category: { $nin: drinkCategories },
        })
        .limit(4)

      // console.log(`🔄 No suggestions found, returning ${randomFoods.length} random foods`)
      return res.json({
        success: true,
        data: randomFoods,
        message: "Không tìm thấy món ăn phù hợp, hiển thị món ăn ngẫu nhiên",
      })
    }

    res.json({ success: true, data: suggestedFoods })
  } catch (error) {
    console.error("❌ Error in getSuggestedFoods:", error)
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý món ăn" })
  }
}

// Debug endpoint for suggested foods - ENHANCED WITH FLEXIBLE SEARCH
const debugSuggestedFoods = async (req, res) => {
  try {
    const { drinkName } = req.params

    // Get all categories first
    const allCategories = await foodModel.distinct("category")

    // Try flexible drink search
    let drink = await foodModel.findOne({
      name: { $regex: new RegExp(`^${drinkName}$`, "i") },
    })

    if (!drink) {
      drink = await foodModel.findOne({
        name: { $regex: drinkName, $options: "i" },
      })
    }

    // Get all possible drinks that match
    const possibleDrinks = await foodModel.find({
      category: "Đồ uống",
      name: { $regex: drinkName, $options: "i" },
    })

    // Find orders with flexible search
    const ordersWithDrink = await orderModel.find({
      "items.name": { $regex: drinkName, $options: "i" },
    })

    // Get unique item names from orders that match the drink pattern
    const matchingOrderItems = []
    ordersWithDrink.forEach((order) => {
      order.items.forEach((item) => {
        if (item.name.toLowerCase().includes(drinkName.toLowerCase())) {
          matchingOrderItems.push(item.name)
        }
      })
    })
    const uniqueMatchingItems = [...new Set(matchingOrderItems)]

    // Get all foods (excluding drink categories)
    const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
    const allFoods = await foodModel.find({
      category: { $nin: drinkCategories },
    })

    const foodNamesSet = new Set(allFoods.map((food) => food.name))

    const foodCount = {}
    const orderAnalysis = []

    ordersWithDrink.forEach((order) => {
      const orderItems = {
        orderId: order._id,
        totalItems: order.items.length,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          matchesDrinkPattern: item.name.toLowerCase().includes(drinkName.toLowerCase()),
          isFood: foodNamesSet.has(item.name),
        })),
      }
      orderAnalysis.push(orderItems)

      order.items.forEach((item) => {
        const isDrinkItem = item.name.toLowerCase().includes(drinkName.toLowerCase())
        if (foodNamesSet.has(item.name) && !isDrinkItem) {
          foodCount[item.name] = (foodCount[item.name] || 0) + (item.quantity || 1)
        }
      })
    })

    res.json({
      success: true,
      debug: {
        searchTerm: drinkName,
        exactDrinkFound: !!drink,
        drinkDetails: drink ? { name: drink.name, category: drink.category } : null,
        possibleDrinks: possibleDrinks.map((d) => ({ name: d.name, category: d.category })),
        uniqueMatchingOrderItems: uniqueMatchingItems,
        allCategories: allCategories,
        drinkCategories: drinkCategories,
        ordersFound: ordersWithDrink.length,
        totalFoodsAvailable: allFoods.length,
        foodsByCategory: allFoods.reduce((acc, food) => {
          acc[food.category] = (acc[food.category] || 0) + 1
          return acc
        }, {}),
        foodCounts: foodCount,
        topSuggestions: Object.entries(foodCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10),
        orderAnalysis: orderAnalysis.slice(0, 3), // Show first 3 orders for debugging
      },
    })
  } catch (error) {
    console.error("Error in debug suggested foods endpoint:", error)
    res.json({ success: false, message: "Debug error" })
  }
}

// Update food item with proper category handling
const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, category } = req.body

    // Find category by name to get ObjectId
    const categoryDoc = await categoryModel.findOne({ name: category })

    if (!categoryDoc) {
      return res.json({ success: false, message: "Category not found" })
    }

    const updateData = {
      name,
      description,
      price,
      category, // Keep string for backward compatibility
      categoryId: categoryDoc._id, // Required ObjectId reference
      updatedAt: new Date(),
    }

    // If new image is uploaded
    if (req.file) {
      const food = await foodModel.findById(id)
      if (food && food.image) {
        fs.unlink(`uploads/${food.image}`, () => {})
      }
      updateData.image = req.file.filename
    }

    await foodModel.findByIdAndUpdate(id, updateData)
    res.json({ success: true, message: "Food Updated" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id)
    fs.unlink(`uploads/${food.image}`, () => {})

    await foodModel.findByIdAndDelete(req.body.id)
    res.json({ success: true, message: "Food Removed" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// remove multiple food items
const removeMultipleFood = async (req, res) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({ success: false, message: "Danh sách ID không hợp lệ" })
    }

    // Get all foods to delete their images
    const foods = await foodModel.find({ _id: { $in: ids } })

    // Delete images
    foods.forEach((food) => {
      if (food.image) {
        fs.unlink(`uploads/${food.image}`, (err) => {
          if (err) console.log("Error deleting image:", err)
        })
      }
    })

    // Delete foods from database
    const result = await foodModel.deleteMany({ _id: { $in: ids } })

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} sản phẩm`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi xóa sản phẩm" })
  }
}

export {
  addFood,
  listFood,
  searchFood,
  removeFood,
  updateFood,
  getFoodByCategory,
  getFoodById,
  removeMultipleFood,
  getSuggestedDrinks,
  getSuggestedFoods,
  debugSuggestedDrinks,
  debugSuggestedFoods,
  getFoodSalesCount,
}
