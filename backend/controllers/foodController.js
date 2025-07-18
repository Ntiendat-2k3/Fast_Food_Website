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
    const foods = await foodModel.find({})
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

// Debug endpoint to check data structure
const debugSuggestedDrinks = async (req, res) => {
  try {
    const { category } = req.params
    console.log(`🐛 Debug for category: ${category}`)

    // Get all orders
    const totalOrders = await orderModel.countDocuments()
    console.log(`📊 Total orders: ${totalOrders}`)

    // Get all foods in the category
    const categoryFoods = await foodModel.find({ category: category })
    console.log(`🍔 Foods in category "${category}":`, categoryFoods.length)

    // Get all drinks
    const drinks = await foodModel.find({ category: "Đồ uống" })
    console.log(`🥤 Total drinks:`, drinks.length)

    // Get all categories
    const allCategories = await foodModel.distinct("category")
    console.log(`📂 All categories:`, allCategories)

    // Get orders that contain items from this category
    const ordersWithCategory = await orderModel.find({
      "items.name": { $in: categoryFoods.map((food) => food.name) },
    })
    console.log(`📦 Orders with ${category}:`, ordersWithCategory.length)

    // Sample order structure
    const sampleOrder = await orderModel.findOne()
    console.log(
      `📋 Sample order structure:`,
      sampleOrder
        ? {
            id: sampleOrder._id,
            items: sampleOrder.items?.slice(0, 2),
            status: sampleOrder.status,
          }
        : "No orders found",
    )

    res.json({
      success: true,
      debug: {
        category,
        totalOrders,
        categoryFoods: categoryFoods.length,
        drinks: drinks.length,
        allCategories,
        ordersWithCategory: ordersWithCategory.length,
        sampleOrder: sampleOrder
          ? {
              items: sampleOrder.items?.slice(0, 2),
              status: sampleOrder.status,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Debug error:", error)
    res.json({ success: false, message: error.message })
  }
}

// Get suggested drinks based on category popularity
const getSuggestedDrinks = async (req, res) => {
  try {
    const { category } = req.params
    const limit = Number.parseInt(req.query.limit) || 4

    console.log(`🔍 Getting suggested drinks for category: ${category}`)

    // Get all food items in the specified category
    const categoryFoods = await foodModel.find({ category: category })
    console.log(`🍔 Found ${categoryFoods.length} foods in category "${category}"`)

    if (categoryFoods.length === 0) {
      console.log(`❌ No foods found in category "${category}"`)
      return res.json({
        success: false,
        message: `Không tìm thấy sản phẩm nào trong danh mục "${category}"`,
      })
    }

    const categoryFoodNames = categoryFoods.map((food) => food.name)
    console.log(`📝 Category food names:`, categoryFoodNames)

    // Find orders that contain items from this category
    const ordersWithCategory = await orderModel.find({
      "items.name": { $in: categoryFoodNames },
    })

    console.log(`📦 Found ${ordersWithCategory.length} orders with ${category} items`)

    if (ordersWithCategory.length === 0) {
      console.log(`❌ No orders found with ${category} items`)
      // Fallback to random drinks
      const randomDrinks = await foodModel.find({ category: "Đồ uống" }).limit(limit)
      return res.json({
        success: true,
        data: randomDrinks,
        message: `Không tìm thấy đơn hàng với ${category}, hiển thị đồ uống ngẫu nhiên`,
      })
    }

    // Get all drinks from these orders and count their frequency
    const drinkCount = {}

    ordersWithCategory.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          // Check if this item is a drink (not in the current category)
          const isDrink = !categoryFoodNames.includes(item.name)
          if (isDrink) {
            drinkCount[item.name] = (drinkCount[item.name] || 0) + (item.quantity || 1)
          }
        })
      }
    })

    console.log(`🥤 Drink counts:`, drinkCount)

    // Get the actual drink objects from database
    const drinkNames = Object.keys(drinkCount)
    if (drinkNames.length === 0) {
      console.log(`❌ No drinks found in orders with ${category}`)
      // Fallback to random drinks
      const randomDrinks = await foodModel.find({ category: "Đồ uống" }).limit(limit)
      return res.json({
        success: true,
        data: randomDrinks,
        message: `Không tìm thấy đồ uống trong đơn hàng với ${category}, hiển thị đồ uống ngẫu nhiên`,
      })
    }

    const suggestedDrinks = await foodModel.find({
      name: { $in: drinkNames },
    })

    // Add purchase count to each drink and sort by popularity
    const drinksWithCount = suggestedDrinks
      .map((drink) => ({
        ...drink.toObject(),
        purchaseCount: drinkCount[drink.name] || 0,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)

    console.log(`✅ Returning ${drinksWithCount.length} suggested drinks`)

    res.json({
      success: true,
      data: drinksWithCount.slice(0, limit),
    })
  } catch (error) {
    console.error("Error getting suggested drinks:", error)
    res.json({ success: false, message: error.message })
  }
}

// Update food item
const updateFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id)
    if (!food) {
      return res.json({ success: false, message: "Food not found" })
    }

    // Update fields
    if (req.body.name) food.name = req.body.name
    if (req.body.description) food.description = req.body.description
    if (req.body.price) food.price = req.body.price
    if (req.body.category) food.category = req.body.category

    // Update image if new one is provided
    if (req.file) {
      // Remove old image
      fs.unlink(`uploads/${food.image}`, () => {})
      food.image = req.file.filename
    }

    await food.save()
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
  debugSuggestedDrinks,
}
