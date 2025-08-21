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
    res.json({ success: false, message: "Debug error" })
  }
}

// Get suggested drinks based on category popularity - FIXED LOGIC
const getSuggestedDrinks = async (req, res) => {
  try {
    const { category } = req.params
    const { productId } = req.query // Optional productId for product-specific suggestions

    // Strategy 1: Product-specific suggestions (if productId provided)
    if (productId) {
      const product = await foodModel.findById(productId)
      if (product) {
        // Find orders containing this specific product
        const ordersWithProduct = await orderModel.find({
          "items.name": product.name,
          status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
        })

        if (ordersWithProduct.length > 0) {
          // Get all drinks
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

          ordersWithProduct.forEach((order) => {
            order.items.forEach((item) => {
              if (drinkNames.includes(item.name) && item.name !== product.name) {
                drinkCount[item.name] = (drinkCount[item.name] || 0) + (item.quantity || 1)
              }
            })
          })

          const suggestedDrinks = drinks
            .filter((drink) => drinkCount[drink.name] > 0)
            .map((drink) => ({
              ...drink.toObject(),
              purchaseCount: drinkCount[drink.name] || 0,
              suggestionType: "product-specific",
            }))
            .sort((a, b) => b.purchaseCount - a.purchaseCount)
            .slice(0, 6)

          if (suggestedDrinks.length > 0) {
            return res.json({
              success: true,
              data: suggestedDrinks,
              message: `Gợi ý dựa trên sản phẩm "${product.name}"`,
            })
          }
        }
      }
    }

    // Strategy 2: Category-based suggestions - if current category is drinks, suggest popular drinks
    if (category === "Đồ uống") {
      // Get all drinks
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

      if (drinks.length > 0) {
        const drinkNames = drinks.map((drink) => drink.name)

        // Find all orders that contain any drinks
        const ordersWithDrinks = await orderModel.find({
          "items.name": { $in: drinkNames },
          status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
        })

        if (ordersWithDrinks.length > 0) {
          const drinkCount = {}

          // Count how many times each drink was ordered
          ordersWithDrinks.forEach((order) => {
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

          if (suggestedDrinks.length > 0) {
            return res.json({
              success: true,
              data: suggestedDrinks,
              message: `Gợi ý đồ uống phổ biến`,
            })
          }
        }
      }
    } else {
      // For non-drink categories, find drinks that were ordered with foods from this category
      let categoryDoc = null
      try {
        categoryDoc = await categoryModel.findOne({ name: category })
      } catch (err) {
        // Category model not found, using string-based search only
      }

      const categoryQuery = categoryDoc
        ? { $or: [{ category: category }, { categoryId: categoryDoc._id }] }
        : { category: category }

      const categoryFoods = await foodModel.find(categoryQuery)

      if (categoryFoods.length > 0) {
        const categoryFoodNames = categoryFoods.map((food) => food.name)

        const ordersWithCategory = await orderModel.find({
          "items.name": { $in: categoryFoodNames },
          status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
        })

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

          if (suggestedDrinks.length > 0) {
            return res.json({
              success: true,
              data: suggestedDrinks,
              message: `Gợi ý dựa trên danh mục "${category}"`,
            })
          }
        }
      }
    }

    // Final fallback: high-quality drinks with better filtering
    const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
    const testKeywords = ["test", "k có đơn", "không có đơn", "demo", "sample", "thử nghiệm"]

    const randomDrinks = await foodModel
      .find({
        $and: [
          { category: { $in: drinkCategories } }, // Fixed: Include drinks, not exclude them
          { isActive: true },
          // Filter out test/demo products
          {
            name: {
              $not: {
                $regex: testKeywords.join("|"),
                $options: "i",
              },
            },
          },
        ],
      })
      .sort({ price: -1, name: 1 }) // Sort by price desc, then name asc for consistent results
      .limit(6)

    return res.json({
      success: true,
      data: randomDrinks.map((drink) => ({ ...drink.toObject(), suggestionType: "random" })),
      message: "Gợi ý đồ uống phổ biến",
      debug: {
        strategy: "random",
        drinkSearched: "N/A",
        ordersFound: 0,
      },
    })
  } catch (error) {
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý đồ uống" })
  }
}

// Get suggested foods based on drink name - FIXED LOGIC WITH FLEXIBLE SEARCH
const getSuggestedFoods = async (req, res) => {
  try {
    const { drinkName } = req.params
    const { drinkId } = req.query // Optional drinkId for drink-specific suggestions

    let drink = null

    // Strategy 1: Drink-specific suggestions (if drinkId provided)
    if (drinkId) {
      drink = await foodModel.findById(drinkId)
      if (drink) {
        const ordersWithDrink = await orderModel.find({
          "items.name": drink.name,
          status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
        })

        if (ordersWithDrink.length > 0) {
          const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
          const allFoods = await foodModel.find({ isActive: true }).populate("categoryId", "name")

          const foods = allFoods.filter((food) => {
            if (food.category && drinkCategories.includes(food.category)) return false
            if (food.categoryId && drinkCategories.includes(food.categoryId.name)) return false
            return true
          })

          const foodNamesSet = new Set(foods.map((food) => food.name))
          const foodCount = {}

          ordersWithDrink.forEach((order) => {
            order.items.forEach((item) => {
              if (foodNamesSet.has(item.name) && item.name !== drink.name) {
                foodCount[item.name] = (foodCount[item.name] || 0) + (item.quantity || 1)
              }
            })
          })

          const suggestedFoods = foods
            .filter((food) => foodCount[food.name] > 0)
            .map((food) => ({
              ...food.toObject(),
              purchaseCount: foodCount[food.name] || 0,
              suggestionType: "drink-specific",
            }))
            .sort((a, b) => b.purchaseCount - a.purchaseCount)
            .slice(0, 6)

          if (suggestedFoods.length > 0) {
            return res.json({
              success: true,
              data: suggestedFoods,
              message: `Gợi ý dựa trên đồ uống "${drink.name}"`,
            })
          }
        }
      }
    }

    // Strategy 2: Name-based suggestions (fallback to original logic)
    if (!drink) {
      drink = await foodModel.findOne({
        name: { $regex: new RegExp(`^${drinkName}$`, "i") },
      })

      if (!drink) {
        drink = await foodModel.findOne({
          name: { $regex: drinkName, $options: "i" },
        })
      }

      if (!drink) {
        const possibleDrinks = await foodModel.find({
          category: "Đồ uống",
          name: { $regex: drinkName, $options: "i" },
        })
        if (possibleDrinks.length > 0) {
          drink = possibleDrinks[0]
        }
      }
    }

    if (drink) {
      const ordersWithDrink = await orderModel.find({
        "items.name": { $regex: drinkName, $options: "i" },
        status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
      })

      if (ordersWithDrink.length > 0) {
        const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
        const foodNamesSet = new Set()
        const foodCount = {}

        ordersWithDrink.forEach((order) => {
          order.items.forEach((item) => {
            const isDrinkItem = item.name.toLowerCase().includes(drinkName.toLowerCase())
            if (!isDrinkItem) {
              foodNamesSet.add(item.name)
              foodCount[item.name] = (foodCount[item.name] || 0) + (item.quantity || 1)
            }
          })
        })

        const foodNamesFromOrders = Array.from(foodNamesSet).filter((foodName) => foodCount[foodName] > 0)

        const existingFoods = await foodModel.find({
          name: { $in: foodNamesFromOrders },
          category: { $nin: drinkCategories },
        })

        const suggestedFoods = existingFoods
          .map((food) => ({
            ...food.toObject(),
            purchaseCount: foodCount[food.name] || 0,
            suggestionType: "name-based",
          }))
          .sort((a, b) => b.purchaseCount - a.purchaseCount)
          .slice(0, 6)

        if (suggestedFoods.length > 0) {
          return res.json({ success: true, data: suggestedFoods })
        }
      }
    }

    // Final fallback: high-quality foods with better filtering
    const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
    const testKeywords = ["test", "k có đơn", "không có đơn", "demo", "sample", "thử nghiệm"]

    const randomFoods = await foodModel
      .find({
        $and: [
          { category: { $nin: drinkCategories } },
          { isActive: true },
          {
            name: {
              $not: {
                $regex: testKeywords.join("|"),
                $options: "i",
              },
            },
          },
        ],
      })
      .sort({ price: -1, name: 1 })
      .limit(6)

    return res.json({
      success: true,
      data: randomFoods.map((food) => ({ ...food.toObject(), suggestionType: "random" })),
      message: "Gợi ý món ăn phổ biến",
      debug: {
        strategy: "random",
        drinkSearched: drinkName,
        ordersFound: 0,
      },
    })
  } catch (error) {
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý món ăn" })
  }
}

// Get suggested drinks for a specific food item
const getSuggestedDrinksByProduct = async (req, res) => {
  try {
    const { productId } = req.params

    // Find the product first
    const product = await foodModel.findById(productId)
    if (!product) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    const totalOrders = await orderModel.countDocuments()

    if (totalOrders === 0) {
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
      const orders = await orderModel.find({
        ...strategy.query,
        status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
      })

      if (orders.length > 0) {
        ordersWithProduct = orders
        successfulStrategy = strategy.description
        break
      }
    }

    // If we have order history for this specific product
    if (ordersWithProduct.length > 0) {
      // Get all drinks from database
      const allDrinks = await foodModel
        .find({
          $or: [{ category: "Đồ uống" }, { categoryId: { $exists: true } }],
        })
        .populate("categoryId", "name")

      // Filter drinks by category name
      const drinks = allDrinks.filter((drink) => {
        if (drink.category === "Đồ uống") return true
        if (drink.categoryId && drink.categoryId.name === "Đồ uống") return true
        return false
      })

      const drinkNames = drinks.map((drink) => drink.name)

      // Count drink occurrences in orders with this specific product
      const drinkCount = {}
      let totalItemsProcessed = 0
      let drinksFoundInOrders = 0

      ordersWithProduct.forEach((order) => {
        order.items.forEach((item) => {
          totalItemsProcessed++
          const itemName = item.name || item.productName
          if (itemName && drinkNames.includes(itemName) && itemName !== product.name) {
            drinkCount[itemName] = (drinkCount[itemName] || 0) + (item.quantity || 1)
            drinksFoundInOrders++
          }
        })
      })

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

      if (suggestedDrinks.length > 0) {
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

    // Fallback to category-based suggestions
    let categoryName = product.category
    if (product.categoryId) {
      const categoryDoc = await categoryModel.findById(product.categoryId)
      if (categoryDoc) {
        categoryName = categoryDoc.name
      }
    }

    const categoryFoods = await foodModel.find({
      $or: [{ category: categoryName }, { categoryId: product.categoryId }],
    })
    const categoryFoodNames = categoryFoods.map((food) => food.name)

    const ordersWithCategory = await orderModel.find({
      "items.name": { $in: categoryFoodNames },
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

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

    // Final fallback: high-quality drinks with better filtering
    const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
    const testKeywords = ["test", "k có đơn", "không có đơn", "demo", "sample", "thử nghiệm"]

    const randomDrinks = await foodModel
      .find({
        $and: [
          { category: { $in: drinkCategories } },
          { isActive: true },
          {
            name: {
              $not: {
                $regex: testKeywords.join("|"),
                $options: "i",
              },
            },
          },
        ],
      })
      .sort({ price: -1, name: 1 })
      .limit(6)

    return res.json({
      success: true,
      data: randomDrinks.map((drink) => ({ ...drink.toObject(), suggestionType: "random" })),
      message: "Gợi ý đồ uống phổ biến",
      debug: {
        strategy: "random",
        productSearched: product.name,
        ordersFound: 0,
      },
    })
  } catch (error) {
    res.json({ success: false, message: "Lỗi server khi lấy gợi ý đồ uống" })
  }
}

// Get suggested foods based on drink ID
const getSuggestedFoodsByDrink = async (req, res) => {
  try {
    const { drinkId } = req.params

    // Find the drink first
    const drink = await foodModel.findById(drinkId)
    if (!drink) {
      return res.json({ success: false, message: "Đồ uống không tồn tại" })
    }

    const ordersWithDrink = await orderModel.find({
      $or: [{ "items.name": drink.name }, { "items.foodId": drinkId }, { "items._id": drinkId }],
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

    // If we have order history for this specific drink
    if (ordersWithDrink.length > 0) {
      // Get all foods (excluding drink categories)
      const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
      const allFoods = await foodModel.find({ isActive: true }).populate("categoryId", "name")

      const foods = allFoods.filter((food) => {
        if (food.category && drinkCategories.includes(food.category)) return false
        if (food.categoryId && drinkCategories.includes(food.categoryId.name)) return false
        return true
      })

      const foodNamesSet = new Set(foods.map((food) => food.name))
      const foodCount = {}

      ordersWithDrink.forEach((order) => {
        order.items.forEach((item) => {
          const isFood =
            (foodNamesSet.has(item.name) || (item.foodId && foodNamesSet.has(item.foodId.toString()))) &&
            item.name !== drink.name &&
            item.foodId?.toString() !== drinkId

          if (isFood) {
            const foodKey = item.name
            foodCount[foodKey] = (foodCount[foodKey] || 0) + (item.quantity || 1)
          }
        })
      })

      const foodNamesFromOrders = Object.keys(foodCount).filter((foodName) => foodCount[foodName] > 0)

      // Verify these foods actually exist in current database
      const existingFoods = await foodModel.find({
        name: { $in: foodNamesFromOrders },
        category: { $nin: drinkCategories },
      })

      // Create suggested foods with actual database objects and purchase counts
      const suggestedFoods = existingFoods
        .map((food) => ({
          ...food.toObject(),
          purchaseCount: foodCount[food.name] || 0,
        }))
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, 6)

      if (suggestedFoods.length > 0) {
        return res.json({
          success: true,
          data: suggestedFoods,
          message: `Gợi ý dựa trên đồ uống "${drink.name}"`,
        })
      }
    }

    // Fallback to category-based suggestions for drinks
    let drinkCategoryName = drink.category
    if (drink.categoryId) {
      const categoryDoc = await categoryModel.findById(drink.categoryId)
      if (categoryDoc) {
        drinkCategoryName = categoryDoc.name
      }
    }

    // Find other drinks in the same category
    const categoryDrinks = await foodModel.find({
      $or: [{ category: drinkCategoryName }, { categoryId: drink.categoryId }],
    })
    const categoryDrinkNames = categoryDrinks.map((d) => d.name)

    const ordersWithCategoryDrinks = await orderModel.find({
      "items.name": { $in: categoryDrinkNames },
      status: { $in: ["Đã hoàn thành", "Đã giao", "Đang xử lý", "Đang giao hàng"] },
    })

    if (ordersWithCategoryDrinks.length > 0) {
      const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
      const allFoods = await foodModel.find({ isActive: true }).populate("categoryId", "name")

      const foods = allFoods.filter((food) => {
        if (food.category && drinkCategories.includes(food.category)) return false
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

    // Final fallback: high-quality foods with better filtering
    const drinkCategories = ["Đồ uống", "Nước uống", "Beverages", "Drinks"]
    const testKeywords = ["test", "k có đơn", "không có đơn", "demo", "sample", "thử nghiệm"]

    const randomFoods = await foodModel
      .find({
        $and: [
          { category: { $nin: drinkCategories } },
          { isActive: true },
          {
            name: {
              $not: {
                $regex: testKeywords.join("|"),
                $options: "i",
              },
            },
          },
        ],
      })
      .sort({ price: -1, name: 1 })
      .limit(6)

    return res.json({
      success: true,
      data: randomFoods.map((food) => ({ ...food.toObject(), suggestionType: "random" })),
      message: "Gợi ý món ăn phổ biến",
      debug: {
        strategy: "random",
        drinkSearched: drink.name,
        ordersFound: 0,
      },
    })
  } catch (error) {
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
        fs.unlink(`uploads/${food.image}`, () => {})
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
