import foodModel from "../models/foodModel.js"
import orderModel from "../models/orderModel.js"
import fs from "fs"

// add food item
const addFood = async (req, res) => {
  const image_filename = `${req.file.filename}`

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  })
  try {
    await food.save()
    res.json({ success: true, message: "Food Added" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// all food list
const listFood = async (req, res) => {
  try {
    const { category } = req.query
    const query = {}

    if (category) {
      query.category = category
    }

    const foods = await foodModel.find(query)
    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// tìm kiếm food
const searchFood = async (req, res) => {
  try {
    const keyword = req.query.keyword
    const foods = await foodModel.find({
      $or: [{ name: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }],
    })
    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Get food by ID
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params
    const food = await foodModel.findById(id)
    if (!food) {
      return res.json({ success: false, message: "Food not found" })
    }
    res.json({ success: true, data: food })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Get food by category
const getFoodByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const foods = await foodModel.find({ category: category })
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

    console.log(`🔍 Getting suggested drinks for category: ${category}`)

    // Get all available categories for debugging
    const allCategories = await foodModel.distinct("category")
    console.log("📂 Available categories:", allCategories)

    // Find all foods in the specified category
    const categoryFoods = await foodModel.find({ category: category })
    console.log(`🍔 Found ${categoryFoods.length} foods in category "${category}"`)

    if (categoryFoods.length === 0) {
      return res.json({
        success: false,
        message: `Không tìm thấy sản phẩm nào trong danh mục "${category}"`,
        availableCategories: allCategories,
      })
    }

    const categoryFoodNames = categoryFoods.map((food) => food.name)
    console.log("📝 Category food names:", categoryFoodNames)

    // Find orders that contain items from this category
    const ordersWithCategory = await orderModel.find({
      "items.name": { $in: categoryFoodNames },
    })

    console.log(`📦 Found ${ordersWithCategory.length} orders with ${category} items`)

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
    console.log("🥤 Available drinks:", drinkNames)

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

    console.log("🥤 Drink counts:", drinkCount)

    // Get the actual drink objects and add purchase count
    const suggestedDrinks = allDrinks
      .filter((drink) => drinkCount[drink.name] > 0)
      .map((drink) => ({
        ...drink.toObject(),
        purchaseCount: drinkCount[drink.name] || 0,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 6) // Limit to top 6

    console.log(`✅ Returning ${suggestedDrinks.length} suggested drinks`)

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

// Update food item
const updateFood = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
    }

    if (req.file) {
      // Remove old image
      const oldFood = await foodModel.findById(id)
      if (oldFood && oldFood.image) {
        fs.unlink(`uploads/${oldFood.image}`, () => {})
      }
      updateData.image = req.file.filename
    }

    const updatedFood = await foodModel.findByIdAndUpdate(id, updateData, { new: true })

    if (!updatedFood) {
      return res.json({ success: false, message: "Food not found" })
    }

    res.json({ success: true, message: "Food Updated", data: updatedFood })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error updating food" })
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
  debugSuggestedDrinks,
  getFoodSalesCount,
}
