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
          status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] }, // Only count confirmed orders
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
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

    // console.log(`📦 Found ${ordersWithCategory.length} orders with ${category} items`)

    if (ordersWithCategory.length === 0) {
      const drinkCategories = await foodModel.distinct("category", {
        $or: [
          { category: { $regex: /uống/i } },
          { category: { $regex: /drink/i } },
          { category: { $regex: /nước/i } },
          { category: { $regex: /beverage/i } },
        ],
      })

      const randomDrinks = await foodModel
        .find({
          category: { $in: drinkCategories },
        })
        .limit(4)

      return res.json({
        success: true,
        data: randomDrinks,
        message: "Không có dữ liệu lịch sử, hiển thị đồ uống ngẫu nhiên",
      })
    }

    const drinkCategories = await foodModel.distinct("category", {
      $or: [
        { category: { $regex: /uống/i } },
        { category: { $regex: /drink/i } },
        { category: { $regex: /nước/i } },
        { category: { $regex: /beverage/i } },
      ],
    })

    // Get all actual drinks from database with improved filtering
    const allDrinks = await foodModel.find({
      category: { $in: drinkCategories },
      $and: [
        { category: { $not: { $regex: /burger/i } } },
        { category: { $not: { $regex: /pizza/i } } },
        { category: { $not: { $regex: /gà/i } } },
        { category: { $not: { $regex: /chicken/i } } },
        { category: { $not: { $regex: /cơm/i } } },
        { category: { $not: { $regex: /rice/i } } },
        { category: { $not: { $regex: /bánh/i } } },
        { category: { $not: { $regex: /bread/i } } },
        { category: { $not: { $regex: /salad/i } } },
      ],
    })

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
      const randomDrinks = await foodModel
        .find({
          category: { $in: drinkCategories },
        })
        .limit(4)
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

    console.log(`[v0] 🔍 Getting suggested foods for drink: ${drinkName}`)

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
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

    console.log(`[v0] 📦 Found ${ordersWithDrink.length} orders with drink pattern "${drinkName}"`)

    if (ordersWithDrink.length > 0) {
      console.log(`[v0] 📋 Orders containing "${drinkName}":`)
      ordersWithDrink.forEach((order, index) => {
        console.log(`[v0] Order ${index + 1} (${order._id}):`)
        order.items.forEach((item, itemIndex) => {
          console.log(`[v0]   Item ${itemIndex + 1}: "${item.name}" (qty: ${item.quantity})`)
        })
      })
    }

    if (ordersWithDrink.length === 0) {
      const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]

      // Get foods that have been ordered before (have purchase history)
      const foodsWithHistory = await orderModel.aggregate([
        { $match: { status: { $in: ["Đã hoàn thành", "Đã giao"] } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalOrdered: { $sum: "$items.quantity" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 10 },
      ])

      const popularFoodNames = foodsWithHistory.map((item) => item._id)

      // Get actual food documents for popular items
      let fallbackFoods = await foodModel
        .find({
          name: { $in: popularFoodNames },
          category: { $nin: drinkCategories },
        })
        .limit(4)

      // If still no foods with history, get established foods (not the newest ones)
      if (fallbackFoods.length === 0) {
        fallbackFoods = await foodModel
          .find({ category: { $nin: drinkCategories } })
          .sort({ createdAt: 1 }) // Get older, more established products
          .limit(4)
      }

      return res.json({
        success: true,
        data: fallbackFoods,
        message: "Không có dữ liệu lịch sử, hiển thị món ăn phổ biến",
      })
    }

    // Create a map of food names for quick lookup
    const foodNamesSet = new Set()

    // Count food occurrences in orders that contain the target drink
    const foodCount = {}

    console.log(`[v0] 🔍 Processing orders to count food occurrences...`)

    ordersWithDrink.forEach((order, orderIndex) => {
      console.log(`[v0] Processing order ${orderIndex + 1}:`)
      order.items.forEach((item, itemIndex) => {
        // Only count if the item is actually a food (not the drink itself and exists in foods)
        const isDrinkItem = item.name.toLowerCase().includes(drinkName.toLowerCase())
        console.log(`[v0]   Item "${item.name}": isDrinkItem=${isDrinkItem}`)

        if (!isDrinkItem) {
          foodNamesSet.add(item.name)
          foodCount[item.name] = (foodCount[item.name] || 0) + (item.quantity || 1)
          console.log(`[v0]     Added to suggestions: ${item.name} (count: ${foodCount[item.name]})`)
        } else {
          console.log(`[v0]     Skipped (is drink): ${item.name}`)
        }
      })
    })

    console.log(`[v0] 📊 Final food count:`, foodCount)

    const foodNamesFromOrders = Array.from(foodNamesSet).filter((foodName) => foodCount[foodName] > 0)

    // Verify these foods actually exist in current database
    const existingFoods = await foodModel.find({
      name: { $in: foodNamesFromOrders },
      category: { $nin: ["Đồ uống", "Nước uống", "Beverages", "Drinks"] },
    })

    console.log(
      `[v0] 🔍 Found ${existingFoods.length} existing foods in database from ${foodNamesFromOrders.length} order items`,
    )

    // Create suggested foods with actual database objects and purchase counts
    const suggestedFoods = existingFoods
      .map((food) => ({
        ...food.toObject(),
        purchaseCount: foodCount[food.name] || 0,
      }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, 6) // Limit to top 6

    console.log(
      `[v0] ✅ Final suggested foods:`,
      suggestedFoods.map((f) => `${f.name} (${f.purchaseCount})`),
    )

    if (suggestedFoods.length === 0) {
      console.log(`[v0] ⚠️ No existing foods found in database that match order history`)
      return res.json({
        success: true,
        data: [],
        message: "Chưa có dữ liệu gợi ý phù hợp",
      })
    }

    res.json({ success: true, data: suggestedFoods })
  } catch (error) {
    console.error("❌ Error in getSuggestedFoods:", error)
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý món ăn" })
  }
}

// Get suggested drinks for a specific food item
const getSuggestedDrinksByProduct = async (req, res) => {
  try {
    const { productId } = req.params
    console.log(`[v0] 🔍 Getting suggested drinks for productId: ${productId}`)

    // Find the product first
    const product = await foodModel.findById(productId)
    if (!product) {
      console.log(`[v0] ❌ Product not found with ID: ${productId}`)
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    console.log(`[v0] ✅ Found product: "${product.name}" in category: "${product.category}"`)

    const totalOrders = await orderModel.countDocuments()
    console.log(`[v0] 📊 Total orders in database: ${totalOrders}`)

    if (totalOrders === 0) {
      console.log(`[v0] ❌ No orders found in database - returning random drinks`)
      const randomDrinks = await foodModel
        .find({
          $or: [{ category: "Đồ uống" }, { categoryId: { $exists: true } }],
        })
        .populate("categoryId", "name")
        .limit(4)

      const drinks = randomDrinks.filter((drink) => {
        if (drink.category === "Đồ uống") return true
        if (drink.categoryId && drink.categoryId.name === "Đồ uống") return true
        return false
      })

      return res.json({
        success: true,
        data: drinks.map((drink) => ({ ...drink.toObject(), suggestionType: "random" })),
        message: "Chưa có đơn hàng nào, hiển thị đồ uống ngẫu nhiên",
        debug: { strategy: "no-orders", totalOrders: 0 },
      })
    }

    const sampleOrders = await orderModel.find().limit(3)
    console.log(`[v0] 🔍 Sample orders structure:`)
    sampleOrders.forEach((order, index) => {
      console.log(`[v0] Order ${index + 1}:`)
      console.log(`[v0]   ID: ${order._id}`)
      console.log(`[v0]   Status: ${order.status}`)
      console.log(`[v0]   Items count: ${order.items?.length || 0}`)
      if (order.items && order.items.length > 0) {
        console.log(`[v0]   First item structure:`, {
          keys: Object.keys(order.items[0]),
          sample: order.items[0],
        })
      }
    })

    const ordersByStatus = await orderModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    console.log(`[v0] 📊 Orders by status:`, ordersByStatus)

    // Strategy 1: Find orders containing this specific product
    const searchStrategies = [
      { query: { "items.name": product.name }, description: "by items.name" },
      { query: { "items._id": productId }, description: "by items._id" },
      { query: { "items.productId": productId }, description: "by items.productId" },
      { query: { "items.foodId": productId }, description: "by items.foodId" },
      { query: { "items.id": productId }, description: "by items.id" },
    ]

    let ordersWithProduct = []
    let successfulStrategy = null

    for (const strategy of searchStrategies) {
      console.log(`[v0] 🔍 Trying strategy: ${strategy.description}`)
      console.log(`[v0] Query:`, JSON.stringify(strategy.query))

      const ordersNoStatus = await orderModel.find(strategy.query)
      console.log(`[v0] Found ${ordersNoStatus.length} orders without status filter`)

      const orders = await orderModel.find({
        ...strategy.query,
        status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
      })

      console.log(`[v0] Found ${orders.length} orders with status filter: ${strategy.description}`)

      if (orders.length > 0) {
        ordersWithProduct = orders
        successfulStrategy = strategy.description
        console.log(`[v0] ✅ Using successful strategy: ${successfulStrategy}`)

        // Debug: Show sample order structure
        const sampleOrder = orders[0]
        console.log(`[v0] Sample order structure:`)
        console.log(`[v0] Order ID: ${sampleOrder._id}`)
        console.log(`[v0] Order status: ${sampleOrder.status}`)
        console.log(`[v0] Order items count: ${sampleOrder.items.length}`)
        console.log(
          `[v0] Sample items:`,
          sampleOrder.items.slice(0, 3).map((item) => ({
            name: item.name,
            productId: item.productId,
            foodId: item.foodId,
            _id: item._id,
            id: item.id,
            quantity: item.quantity,
            allKeys: Object.keys(item),
          })),
        )
        break
      }
    }

    console.log(`[v0] Total orders found with product: ${ordersWithProduct.length}`)

    // If we have order history for this specific product
    if (ordersWithProduct.length > 0) {
      console.log(`[v0] 📊 Analyzing ${ordersWithProduct.length} orders for drink suggestions`)

      // Get all drinks from database
      const allDrinks = await foodModel
        .find({
          $or: [{ category: "Đồ uống" }, { categoryId: { $exists: true } }],
        })
        .populate("categoryId", "name")

      console.log(`[v0] Found ${allDrinks.length} potential drinks in database`)

      // Filter drinks by category name
      const drinks = allDrinks.filter((drink) => {
        if (drink.category === "Đồ uống") return true
        if (drink.categoryId && drink.categoryId.name === "Đồ uống") return true
        return false
      })

      console.log(`[v0] Filtered to ${drinks.length} actual drinks`)
      console.log(
        `[v0] Drink names:`,
        drinks.slice(0, 5).map((d) => d.name),
      )

      const drinkNames = drinks.map((drink) => drink.name)

      // Count drink occurrences in orders with this specific product
      const drinkCount = {}
      let totalItemsProcessed = 0
      let drinksFoundInOrders = 0

      ordersWithProduct.forEach((order, orderIndex) => {
        console.log(`[v0] Processing order ${orderIndex + 1}/${ordersWithProduct.length}: ${order._id}`)

        order.items.forEach((item, itemIndex) => {
          totalItemsProcessed++
          const itemName = item.name || item.productName
          console.log(`[v0]   Item ${itemIndex + 1}: "${itemName}" (qty: ${item.quantity || 1})`)

          if (itemName && drinkNames.includes(itemName) && itemName !== product.name) {
            drinkCount[itemName] = (drinkCount[itemName] || 0) + (item.quantity || 1)
            drinksFoundInOrders++
            console.log(`[v0]   ✅ Found drink: "${itemName}" (total count: ${drinkCount[itemName]})`)
          }
        })
      })

      console.log(`[v0] 📊 Processing summary:`)
      console.log(`[v0] Total items processed: ${totalItemsProcessed}`)
      console.log(`[v0] Drinks found in orders: ${drinksFoundInOrders}`)
      console.log(`[v0] Unique drinks with counts:`, drinkCount)

      // Get suggested drinks with purchase count
      const suggestedDrinks = drinks
        .filter((drink) => drinkCount[drink.name] > 0)
        .map((drink) => ({
          ...drink.toObject(),
          purchaseCount: drinkCount[drink.name] || 0,
          suggestionType: "product-specific",
        }))
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 6)

      console.log(`[v0] ✅ Generated ${suggestedDrinks.length} product-specific suggestions`)

      if (suggestedDrinks.length > 0) {
        console.log(
          `[v0] Top suggestions:`,
          suggestedDrinks.map((d) => `${d.name} (${d.purchaseCount})`),
        )
        return res.json({
          success: true,
          data: suggestedDrinks,
          message: `Gợi ý dựa trên sản phẩm "${product.name}"`,
          debug: {
            strategy: successfulStrategy,
            ordersAnalyzed: ordersWithProduct.length,
            totalItemsProcessed,
            drinksFoundInOrders,
            drinkCounts: drinkCount,
          },
        })
      }
    }

    console.log(`[v0] 🔄 No product-specific suggestions found, trying category-based fallback`)

    // Fallback to category-based suggestions
    let categoryName = product.category
    if (product.categoryId) {
      const categoryDoc = await categoryModel.findById(product.categoryId)
      if (categoryDoc) {
        categoryName = categoryDoc.name
      }
    }

    console.log(`[v0] Using category: "${categoryName}" for fallback`)

    // Use existing category-based logic as fallback
    const categoryFoods = await foodModel.find({
      $or: [{ category: categoryName }, { categoryId: product.categoryId }],
    })
    const categoryFoodNames = categoryFoods.map((food) => food.name)

    console.log(`[v0] Found ${categoryFoods.length} foods in category "${categoryName}"`)
    console.log(`[v0] Category food names:`, categoryFoodNames.slice(0, 5))

    const ordersWithCategory = await orderModel.find({
      "items.name": { $in: categoryFoodNames },
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

    console.log(`[v0] Found ${ordersWithCategory.length} orders with category foods`)

    if (ordersWithCategory.length > 0) {
      const allDrinks = await foodModel
        .find({
          $or: [{ category: "Đồ uống" }, { categoryId: { $exists: true } }],
        })
        .populate("categoryId", "name")

      const drinks = allDrinks.filter((drink) => {
        if (drink.category === "Đồ uống") return true
        if (drink.categoryId && drink.categoryId.name === "Đồ uống") return true
        return false
      })

      const drinkNames = drinks.map((drink) => drink.name)
      const drinkCount = {}

      ordersWithCategory.forEach((order) => {
        order.items.forEach((item) => {
          if (drinkNames.includes(item.name)) {
            drinkCount[item.name] = (drinkCount[item.name] || 0) + (item.quantity || 1)
          }
        })
      })

      const suggestedDrinks = drinks
        .filter((drink) => drinkCount[drink.name] > 0)
        .map((drink) => ({
          ...drink.toObject(),
          purchaseCount: drinkCount[drink.name] || 0,
          suggestionType: "category-based",
        }))
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 6)

      console.log(`[v0] ✅ Generated ${suggestedDrinks.length} category-based suggestions`)

      if (suggestedDrinks.length > 0) {
        return res.json({
          success: true,
          data: suggestedDrinks,
          message: `Gợi ý dựa trên danh mục "${categoryName}"`,
          debug: {
            strategy: "category-based",
            categoryName,
            categoryFoodsCount: categoryFoods.length,
            ordersAnalyzed: ordersWithCategory.length,
          },
        })
      }
    }

    console.log(`[v0] 🎲 Using random fallback`)

    // Final fallback: random drinks
    const randomDrinks = await foodModel
      .find({
        $or: [{ category: "Đồ uống" }, { categoryId: { $exists: true } }],
      })
      .populate("categoryId", "name")
      .limit(4)

    const drinks = randomDrinks.filter((drink) => {
      if (drink.category === "Đồ uống") return true
      if (drink.categoryId && drink.categoryId.name === "Đồ uống") return true
      return false
    })

    console.log(`[v0] ✅ Returning ${drinks.length} random drinks as fallback`)

    return res.json({
      success: true,
      data: drinks.map((drink) => ({ ...drink.toObject(), suggestionType: "random" })),
      message: "Không có dữ liệu lịch sử, hiển thị đồ uống ngẫu nhiên",
      debug: {
        strategy: "random",
        productSearched: product.name,
        ordersFound: ordersWithProduct.length,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Error in getSuggestedDrinksByProduct:", error)
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý đồ uống" })
  }
}

// Get suggested foods based on drink ID
const getSuggestedFoodsByDrink = async (req, res) => {
  try {
    const { drinkId } = req.params
    console.log(`[v0] 🔍 Getting suggested foods for drinkId: ${drinkId}`)

    // Find the drink first
    const drink = await foodModel.findById(drinkId)
    if (!drink) {
      console.log(`[v0] ❌ Drink not found with ID: ${drinkId}`)
      return res.json({ success: false, message: "Đồ uống không tồn tại" })
    }

    console.log(`[v0] ✅ Found drink: "${drink.name}" in category: "${drink.category}"`)

    // Find orders that contain this specific drink
    const ordersWithDrink = await orderModel.find({
      "items.name": drink.name,
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

    console.log(`[v0] Found ${ordersWithDrink.length} orders containing drink "${drink.name}"`)

    // If we have order history for this specific drink
    if (ordersWithDrink.length > 0) {
      console.log(`[v0] 📊 Analyzing ${ordersWithDrink.length} orders for food suggestions`)

      // Get all foods (excluding drink categories)
      const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
      const allFoods = await foodModel
        .find({
          $and: [{ category: { $nin: drinkCategories } }, { isActive: true }],
        })
        .populate("categoryId", "name")

      console.log(`[v0] Found ${allFoods.length} potential foods in database`)

      // Also filter by categoryId for drinks
      const foods = allFoods.filter((food) => {
        if (drinkCategories.includes(food.category)) return false
        if (food.categoryId && drinkCategories.includes(food.categoryId.name)) return false
        return true
      })

      console.log(`[v0] Filtered to ${foods.length} actual foods (excluding drinks)`)
      console.log(
        `[v0] Sample food names:`,
        foods.slice(0, 5).map((f) => f.name),
      )

      const foodNamesSet = new Set(foods.map((food) => food.name))

      // Count food occurrences in orders with this specific drink
      const foodCount = {}
      let totalItemsProcessed = 0
      let foodsFoundInOrders = 0

      ordersWithDrink.forEach((order, orderIndex) => {
        console.log(`[v0] Processing order ${orderIndex + 1}/${ordersWithDrink.length}: ${order._id}`)

        order.items.forEach((item, itemIndex) => {
          totalItemsProcessed++
          console.log(`[v0]   Item ${itemIndex + 1}: "${item.name}" (qty: ${item.quantity || 1})`)

          if (foodNamesSet.has(item.name) && item.name !== drink.name) {
            foodCount[item.name] = (foodCount[item.name] || 0) + (item.quantity || 1)
            foodsFoundInOrders++
            console.log(`[v0]   ✅ Found food: "${item.name}" (total count: ${foodCount[item.name]})`)
          }
        })
      })

      console.log(`[v0] 📊 Processing summary:`)
      console.log(`[v0] Total items processed: ${totalItemsProcessed}`)
      console.log(`[v0] Foods found in orders: ${foodsFoundInOrders}`)
      console.log(`[v0] Unique foods with counts:`, foodCount)

      const foodNamesFromOrders = Array.from(foodNamesSet).filter((foodName) => foodCount[foodName] > 0)

      // Verify these foods actually exist in current database
      const existingFoods = await foodModel.find({
        name: { $in: foodNamesFromOrders },
        category: { $nin: drinkCategories },
      })

      console.log(
        `[v0] 🔍 Found ${existingFoods.length} existing foods in database from ${foodNamesFromOrders.length} order items`,
      )

      // Create suggested foods with actual database objects and purchase counts
      const suggestedFoods = existingFoods
        .map((food) => ({
          ...food.toObject(),
          purchaseCount: foodCount[food.name] || 0,
        }))
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 6) // Limit to top 6

      console.log(
        `[v0] ✅ Final suggested foods:`,
        suggestedFoods.map((f) => `${f.name} (${f.purchaseCount})`),
      )

      if (suggestedFoods.length === 0) {
        console.log(`[v0] ⚠️ No existing foods found in database that match order history`)
        return res.json({
          success: true,
          data: [],
          message: "Chưa có dữ liệu gợi ý phù hợp",
        })
      }

      res.json({ success: true, data: suggestedFoods })
    }

    console.log(`[v0] 🔄 No drink-specific suggestions found, trying category-based fallback`)

    // Fallback to category-based suggestions for drinks
    let drinkCategoryName = drink.category
    if (drink.categoryId) {
      const categoryDoc = await categoryModel.findById(drink.categoryId)
      if (categoryDoc) {
        drinkCategoryName = categoryDoc.name
      }
    }

    console.log(`[v0] Using drink category: "${drinkCategoryName}" for fallback`)

    // Find other drinks in the same category
    const categoryDrinks = await foodModel.find({
      $or: [{ category: drinkCategoryName }, { categoryId: drink.categoryId }],
    })
    const categoryDrinkNames = categoryDrinks.map((d) => d.name)

    console.log(`[v0] Found ${categoryDrinks.length} drinks in category "${drinkCategoryName}"`)

    const ordersWithCategoryDrinks = await orderModel.find({
      "items.name": { $in: categoryDrinkNames },
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

    console.log(`[v0] Found ${ordersWithCategoryDrinks.length} orders with category drinks`)

    if (ordersWithCategoryDrinks.length > 0) {
      const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
      const allFoods = await foodModel
        .find({
          $and: [{ category: { $nin: drinkCategories } }, { isActive: true }],
        })
        .populate("categoryId", "name")

      const foods = allFoods.filter((food) => {
        if (drinkCategories.includes(food.category)) return false
        if (food.categoryId && drinkCategories.includes(food.categoryId.name)) return false
        return true
      })

      const foodNamesSet = new Set(foods.map((food) => food.name))
      const foodCount = {}

      ordersWithCategoryDrinks.forEach((order) => {
        order.items.forEach((item) => {
          if (foodNamesSet.has(item.name)) {
            foodCount[item.name] = (foodCount[item.name] || 0) + (item.quantity || 1)
          }
        })
      })

      const suggestedFoods = foods
        .filter((food) => foodCount[food.name] > 0)
        .map((food) => ({
          ...food.toObject(),
          purchaseCount: foodCount[food.name] || 0,
          suggestionType: "category-based",
        }))
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 6)

      console.log(`[v0] ✅ Generated ${suggestedFoods.length} category-based suggestions`)

      if (suggestedFoods.length > 0) {
        return res.json({
          success: true,
          data: suggestedFoods,
          message: `Gợi ý dựa trên danh mục đồ uống "${drinkCategoryName}"`,
          debug: {
            strategy: "category-based",
            drinkCategoryName,
            categoryDrinksCount: categoryDrinks.length,
            ordersAnalyzed: ordersWithCategoryDrinks.length,
          },
        })
      }
    }

    console.log(`[v0] 🎲 Using random fallback`)

    // Final fallback: random foods
    const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
    const randomFoods = await foodModel
      .find({
        $and: [{ category: { $nin: drinkCategories } }, { isActive: true }],
      })
      .limit(4)

    console.log(`[v0] ✅ Returning ${randomFoods.length} random foods as fallback`)

    return res.json({
      success: true,
      data: randomFoods.map((food) => ({ ...food.toObject(), suggestionType: "random" })),
      message: "Không có dữ liệu lịch sử, hiển thị món ăn ngẫu nhiên",
      debug: {
        strategy: "random",
        drinkSearched: drink.name,
        ordersFound: ordersWithDrink.length,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Error in getSuggestedFoodsByDrink:", error)
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý món ăn" })
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
  getSuggestedDrinksByProduct,
  getSuggestedFoodsByDrink,
  debugSuggestedDrinks,
  getFoodSalesCount,
}
