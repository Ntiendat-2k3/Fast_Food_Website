import inventoryModel from "../models/inventoryModel.js"
import foodModel from "../models/foodModel.js"

// Get all inventory items with food details
const getInventoryList = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const search = req.query.search || ""
    const status = req.query.status || ""

    // Build query
    const query = {}

    // Add status filter
    if (status && status !== "all") {
      query.status = status
    }

    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "foods",
          localField: "foodId",
          foreignField: "_id",
          as: "foodId",
        },
      },
      {
        $unwind: "$foodId",
      },
    ]

    // Add search filter
    if (search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { "foodId.name": { $regex: search, $options: "i" } },
            { "foodId.category": { $regex: search, $options: "i" } },
          ],
        },
      })
    }

    // Add status filter
    if (status && status !== "all") {
      pipeline.push({
        $match: { status: status },
      })
    }

    // Add fields to recalculate status based on current logic
    pipeline.push({
      $addFields: {
        status: {
          $cond: {
            if: { $eq: ["$quantity", 0] },
            then: "out_of_stock",
            else: {
              $cond: {
                if: { $lte: ["$quantity", 20] },
                then: "low_stock",
                else: "in_stock",
              },
            },
          },
        },
      },
    })

    // Apply status filter again after recalculation if needed
    if (status && status !== "all") {
      pipeline.push({
        $match: { status: status },
      })
    }

    // Sort by last updated
    pipeline.push({
      $sort: { lastUpdated: -1 },
    })

    // Get total count
    const countPipeline = [...pipeline, { $count: "total" }]
    const totalResult = await inventoryModel.aggregate(countPipeline)
    const totalItems = totalResult.length > 0 ? totalResult[0].total : 0
    const totalPages = Math.ceil(totalItems / limit)

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit })

    // Execute query
    const inventoryItems = await inventoryModel.aggregate(pipeline)

    // Update the actual documents with correct status
    for (const item of inventoryItems) {
      await inventoryModel.findByIdAndUpdate(item._id, {
        status: item.status,
        lastUpdated: new Date(),
      })
    }

    res.json({
      success: true,
      data: inventoryItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching inventory list:", error)
    res.json({
      success: false,
      message: "Lỗi khi tải danh sách kho hàng",
    })
  }
}

// Get inventory by food ID
const getInventoryByFoodId = async (req, res) => {
  try {
    const { foodId } = req.params

    const inventory = await inventoryModel.findOne({ foodId }).populate("foodId", "name image category price")

    console.log("inventory", inventory)

    if (!inventory) {
      return res.json({ success: false, message: "Không tìm thấy thông tin kho hàng" })
    }

    res.json({ success: true, data: inventory })
  } catch (error) {
    console.error("Error fetching inventory by food ID:", error)
    res.json({ success: false, message: "Lỗi khi lấy thông tin kho hàng" })
  }
}

// Update inventory quantity
const updateInventory = async (req, res) => {
  try {
    const { foodId, quantity, maxStockLevel, updatedBy } = req.body

    if (!foodId) {
      return res.json({
        success: false,
        message: "Thiếu thông tin sản phẩm",
      })
    }

    // Calculate status based on quantity
    let status = "out_of_stock"
    if (quantity > 20) {
      status = "in_stock"
    } else if (quantity > 0) {
      status = "low_stock"
    }

    const updateData = {
      quantity: Number.parseInt(quantity) || 0,
      maxStockLevel: Number.parseInt(maxStockLevel) || 1000,
      status: status,
      lastUpdated: new Date(),
      updatedBy: updatedBy || "admin",
    }

    const updatedInventory = await inventoryModel
      .findOneAndUpdate({ foodId: foodId }, updateData, { new: true, upsert: true })
      .populate("foodId")

    res.json({
      success: true,
      message: "Cập nhật kho hàng thành công",
      data: updatedInventory,
    })
  } catch (error) {
    console.error("Error updating inventory:", error)
    res.json({
      success: false,
      message: "Lỗi khi cập nhật kho hàng",
    })
  }
}

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "foods",
          localField: "foodId",
          foreignField: "_id",
          as: "foodId",
        },
      },
      {
        $unwind: "$foodId",
      },
      {
        $addFields: {
          status: {
            $cond: {
              if: { $eq: ["$quantity", 0] },
              then: "out_of_stock",
              else: {
                $cond: {
                  if: { $lte: ["$quantity", 20] },
                  then: "low_stock",
                  else: "in_stock",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          inStock: {
            $sum: {
              $cond: [{ $eq: ["$status", "in_stock"] }, 1, 0],
            },
          },
          lowStock: {
            $sum: {
              $cond: [{ $eq: ["$status", "low_stock"] }, 1, 0],
            },
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ["$status", "out_of_stock"] }, 1, 0],
            },
          },
          totalValue: {
            $sum: { $multiply: ["$quantity", "$foodId.price"] },
          },
        },
      },
    ]

    const stats = await inventoryModel.aggregate(pipeline)

    const result =
      stats.length > 0
        ? stats[0]
        : {
            totalItems: 0,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            totalValue: 0,
          }

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    res.json({
      success: false,
      message: "Lỗi khi tải thống kê kho hàng",
    })
  }
}

// Initialize inventory for existing foods with 50 items each
const initializeInventory = async (req, res) => {
  try {
    // Get all foods
    const foods = await foodModel.find({})

    let createdCount = 0
    let updatedCount = 0
    const results = []

    for (const food of foods) {
      try {
        const existingInventory = await inventoryModel.findOne({ foodId: food._id })

        if (!existingInventory) {
          // Create new inventory record with 50 items (in_stock status)
          const newInventory = new inventoryModel({
            foodId: food._id,
            quantity: 50,
            maxStockLevel: 1000,
            status: "in_stock",
            updatedBy: "system",
            lastUpdated: new Date(),
          })

          await newInventory.save()
          createdCount++
          results.push({
            foodName: food.name,
            action: "created",
            quantity: 50,
            status: "in_stock",
          })
        } else {
          // Update existing record to 50 items and correct status
          const updatedInventory = await inventoryModel.findByIdAndUpdate(
            existingInventory._id,
            {
              quantity: 50,
              status: "in_stock",
              lastUpdated: new Date(),
              updatedBy: "system",
            },
            { new: true },
          )

          updatedCount++
          results.push({
            foodName: food.name,
            action: "updated",
            oldQuantity: existingInventory.quantity,
            newQuantity: 50,
            status: "in_stock",
          })
        }
      } catch (error) {
        results.push({
          foodName: food.name,
          action: "error",
          error: error.message,
        })
      }
    }

    res.json({
      success: true,
      message: `Khởi tạo kho hàng thành công! Tạo mới: ${createdCount}, Cập nhật: ${updatedCount}`,
      data: {
        createdCount,
        updatedCount,
        totalProcessed: foods.length,
        results,
      },
    })
  } catch (error) {
    console.error("Error initializing inventory:", error)
    res.json({
      success: false,
      message: "Lỗi khi khởi tạo kho hàng",
      error: error.message,
    })
  }
}

// Check product availability
const checkAvailability = async (req, res) => {
  try {
    const { foodId, requestedQuantity } = req.body

    const inventory = await inventoryModel.findOne({ foodId }).populate("foodId")

    if (!inventory) {
      return res.json({
        success: false,
        message: "Sản phẩm không tồn tại trong kho",
        available: false,
      })
    }

    const available = inventory.quantity >= requestedQuantity

    res.json({
      success: true,
      available,
      currentStock: inventory.quantity,
      requestedQuantity,
      message: available ? "Đủ hàng" : "Không đủ hàng trong kho",
    })
  } catch (error) {
    console.error("Error checking availability:", error)
    res.json({
      success: false,
      message: "Lỗi khi kiểm tra tồn kho",
    })
  }
}

// Reduce stock when order is placed
const reduceStock = async (req, res) => {
  try {
    const { items, orderId } = req.body // items: [{ foodId, quantity }]

    if (!items || !Array.isArray(items)) {
      return res.json({
        success: false,
        message: "Danh sách sản phẩm không hợp lệ",
      })
    }

    const results = []

    for (const item of items) {
      const { foodId, quantity } = item

      const inventory = await inventoryModel.findOne({ foodId })

      if (!inventory) {
        results.push({
          foodId,
          success: false,
          message: "Sản phẩm không tồn tại trong kho",
        })
        continue
      }

      if (inventory.quantity < quantity) {
        results.push({
          foodId,
          success: false,
          message: `Không đủ hàng (còn ${inventory.quantity}, yêu cầu ${quantity})`,
        })
        continue
      }

      // Reduce stock
      const newQuantity = inventory.quantity - quantity
      let newStatus = "out_of_stock"
      if (newQuantity > 20) {
        newStatus = "in_stock"
      } else if (newQuantity > 0) {
        newStatus = "low_stock"
      }

      await inventoryModel.findByIdAndUpdate(inventory._id, {
        quantity: newQuantity,
        status: newStatus,
        lastUpdated: new Date(),
        updatedBy: `order_${orderId}`,
      })

      results.push({
        foodId,
        success: true,
        oldQuantity: inventory.quantity,
        newQuantity,
        reducedBy: quantity,
      })
    }

    const allSuccess = results.every((r) => r.success)

    res.json({
      success: allSuccess,
      message: allSuccess ? "Cập nhật tồn kho thành công" : "Một số sản phẩm không thể cập nhật",
      results,
    })
  } catch (error) {
    console.error("Error reducing stock:", error)
    res.json({
      success: false,
      message: "Lỗi khi cập nhật tồn kho",
    })
  }
}

export {
  getInventoryList,
  getInventoryByFoodId,
  updateInventory,
  getInventoryStats,
  initializeInventory,
  checkAvailability,
  reduceStock,
}
