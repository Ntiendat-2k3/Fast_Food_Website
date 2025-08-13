import userModel from "../models/userModel.js"
import cartModel from "../models/cartModel.js"
import foodModel from "../models/foodModel.js"

// Get cart data
const getCart = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId
    console.log("Getting cart for user:", userId)

    // Find user to verify existence
    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "User not found" })
    }

    // Get cart from cart collection
    let cart = await cartModel.findOne({ userId }).populate("items.foodId")

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new cartModel({
        userId,
        items: [],
        totalAmount: 0,
      })
      await cart.save()
    }

    // Convert cart items to the format expected by frontend (id-based)
    const cartData = {}
    for (const item of cart.items) {
      if (item.foodId && item.foodId._id) {
        cartData[item.foodId._id.toString()] = item.quantity
      }
    }

    console.log("Cart data retrieved:", cartData)
    res.json({ success: true, cartData })
  } catch (error) {
    console.error("Error getting cart:", error)
    res.json({ success: false, message: "Lỗi khi tải giỏ hàng" })
  }
}

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId
    const { itemId, quantity = 1 } = req.body
    // Also check for alternative parameter names that frontend might be using
    const productId = itemId || req.body.productId || req.body.id || req.body._id
    console.log("Adding to cart:", { userId, productId, quantity })

    if (!userId) {
      return res.json({ success: false, message: "Thiếu thông tin người dùng" })
    }

    // Verify user exists
    const userData = await userModel.findById(userId)
    if (!userData) {
      console.log("User not found with ID:", userId)
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Find the food item by ID
    if (!productId) {
      console.log("Missing product ID. Request body:", req.body)
      return res.json({ success: false, message: "Thiếu ID sản phẩm" })
    }

    const foodItem = await foodModel.findById(productId)
    if (!foodItem) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    // Find or create cart
    let cart = await cartModel.findOne({ userId })
    if (!cart) {
      cart = new cartModel({
        userId,
        items: [],
        totalAmount: 0,
      })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.foodId.toString() === foodItem._id.toString())

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += Number.parseInt(quantity)
      cart.items[existingItemIndex].price = foodItem.price // Update price in case it changed
    } else {
      // Add new item
      cart.items.push({
        foodId: foodItem._id,
        quantity: Number.parseInt(quantity),
        price: foodItem.price,
      })
    }

    // Save cart (pre-save middleware will calculate totalAmount)
    await cart.save()

    // Populate food data for response
    await cart.populate("items.foodId")

    // Convert to frontend format (id-based)
    const cartData = {}
    for (const item of cart.items) {
      if (item.foodId && item.foodId._id) {
        cartData[item.foodId._id.toString()] = item.quantity
      }
    }

    console.log("Cart updated:", cartData)
    res.json({ success: true, message: "Đã thêm vào giỏ hàng", cartData })
  } catch (error) {
    console.error("Error adding to cart:", error)
    res.json({ success: false, message: "Lỗi khi thêm vào giỏ hàng", error: error.message })
  }
}

// Remove one item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId
    const { itemId } = req.body
    // Also check for alternative parameter names that frontend might be using
    const productId = itemId || req.body.productId || req.body.id || req.body._id
    console.log("Removing from cart:", { userId, productId })

    if (!userId) {
      return res.json({ success: false, message: "Thiếu thông tin người dùng" })
    }

    // Verify user exists
    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Find the food item by ID
    if (!productId) {
      console.log("Missing product ID. Request body:", req.body)
      return res.json({ success: false, message: "Thiếu ID sản phẩm" })
    }

    const foodItem = await foodModel.findById(productId)
    if (!foodItem) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    // Find cart
    const cart = await cartModel.findOne({ userId })
    if (!cart) {
      return res.json({ success: true, message: "Giỏ hàng trống", cartData: {} })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.foodId.toString() === foodItem._id.toString())

    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity > 1) {
        // Decrease quantity
        cart.items[itemIndex].quantity -= 1
      } else {
        // Remove item completely
        cart.items.splice(itemIndex, 1)
      }

      // Save cart
      await cart.save()
    }

    // Populate and convert to frontend format
    await cart.populate("items.foodId")
    const cartData = {}
    for (const item of cart.items) {
      if (item.foodId && item.foodId._id) {
        cartData[item.foodId._id.toString()] = item.quantity
      }
    }

    console.log("Cart updated after removal:", cartData)
    res.json({ success: true, message: "Đã cập nhật giỏ hàng", cartData })
  } catch (error) {
    console.error("Error removing from cart:", error)
    res.json({ success: false, message: "Lỗi khi xóa khỏi giỏ hàng" })
  }
}

// Remove all quantity of a specific item
const removeFromCartAll = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId
    const { itemId } = req.body
    // Also check for alternative parameter names that frontend might be using
    const productId = itemId || req.body.productId || req.body.id || req.body._id
    console.log("Removing all from cart:", { userId, productId })

    if (!userId) {
      return res.json({ success: false, message: "Thiếu thông tin người dùng" })
    }

    // Verify user exists
    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Find the food item by ID
    if (!productId) {
      console.log("Missing product ID. Request body:", req.body)
      return res.json({ success: false, message: "Thiếu ID sản phẩm" })
    }

    const foodItem = await foodModel.findById(productId)
    if (!foodItem) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    // Find cart
    const cart = await cartModel.findOne({ userId })
    if (!cart) {
      return res.json({ success: true, message: "Giỏ hàng trống", cartData: {} })
    }

    // Remove item completely
    cart.items = cart.items.filter((item) => item.foodId.toString() !== foodItem._id.toString())

    // Save cart
    await cart.save()

    // Populate and convert to frontend format
    await cart.populate("items.foodId")
    const cartData = {}
    for (const item of cart.items) {
      if (item.foodId && item.foodId._id) {
        cartData[item.foodId._id.toString()] = item.quantity
      }
    }

    console.log("Item removed completely from cart:", cartData)
    res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng", cartData })
  } catch (error) {
    console.error("Error removing all from cart:", error)
    res.json({ success: false, message: "Lỗi khi xóa sản phẩm" })
  }
}

// Update item quantity directly
const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId
    const { itemId, quantity } = req.body
    // Also check for alternative parameter names that frontend might be using
    const productId = itemId || req.body.productId || req.body.id || req.body._id
    console.log("Updating cart quantity:", { userId, productId, quantity })

    if (!userId) {
      return res.json({ success: false, message: "Thiếu thông tin người dùng" })
    }

    if (quantity < 0) {
      return res.json({ success: false, message: "Số lượng không hợp lệ" })
    }

    // Verify user exists
    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" })
    }

    // Find the food item by ID
    if (!productId) {
      console.log("Missing product ID. Request body:", req.body)
      return res.json({ success: false, message: "Thiếu ID sản phẩm" })
    }

    const foodItem = await foodModel.findById(productId)
    if (!foodItem) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    // Find cart
    let cart = await cartModel.findOne({ userId })
    if (!cart) {
      if (quantity === 0) {
        return res.json({ success: true, message: "Giỏ hàng trống", cartData: {} })
      }
      // Create new cart if doesn't exist and quantity > 0
      cart = new cartModel({
        userId,
        items: [],
        totalAmount: 0,
      })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.foodId.toString() === foodItem._id.toString())

    if (quantity === 0) {
      // Remove item if quantity is 0
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1)
      }
    } else {
      if (itemIndex > -1) {
        // Update existing item
        cart.items[itemIndex].quantity = Number.parseInt(quantity)
        cart.items[itemIndex].price = foodItem.price
      } else {
        // Add new item
        cart.items.push({
          foodId: foodItem._id,
          quantity: Number.parseInt(quantity),
          price: foodItem.price,
        })
      }
    }

    // Save cart
    await cart.save()

    // Populate and convert to frontend format
    await cart.populate("items.foodId")
    const cartData = {}
    for (const item of cart.items) {
      if (item.foodId && item.foodId._id) {
        cartData[item.foodId._id.toString()] = item.quantity
      }
    }

    console.log("Cart quantity updated:", cartData)
    res.json({ success: true, message: "Đã cập nhật số lượng", cartData })
  } catch (error) {
    console.error("Error updating cart quantity:", error)
    res.json({ success: false, message: "Lỗi khi cập nhật số lượng" })
  }
}

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId
    console.log("Clearing cart for user:", userId)

    if (!userId) {
      return res.json({ success: false, message: "Thiếu thông tin người dùng" })
    }

    // Find and clear cart
    await cartModel.findOneAndUpdate(
      { userId },
      {
        items: [],
        totalAmount: 0,
        updatedAt: new Date(),
      },
      { upsert: true },
    )

    console.log("Cart cleared successfully")
    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng", cartData: {} })
  } catch (error) {
    console.error("Error clearing cart:", error)
    res.json({ success: false, message: "Lỗi khi xóa giỏ hàng" })
  }
}

// Remove specific items from cart (for checkout)
const removeItemsFromCart = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId
    const { itemIds } = req.body
    console.log("Removing items from cart:", { userId, itemIds })

    if (!userId) {
      return res.json({ success: false, message: "Thiếu thông tin người dùng" })
    }

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.json({ success: false, message: "Thiếu danh sách sản phẩm cần xóa" })
    }

    // Find cart
    const cart = await cartModel.findOne({ userId })
    if (!cart) {
      return res.json({ success: true, message: "Giỏ hàng trống", cartData: {} })
    }

    // Remove specified items
    cart.items = cart.items.filter((item) => !itemIds.includes(item.foodId.toString()))

    // Save cart
    await cart.save()

    // Populate and convert to frontend format
    await cart.populate("items.foodId")
    const cartData = {}
    for (const item of cart.items) {
      if (item.foodId && item.foodId._id) {
        cartData[item.foodId._id.toString()] = item.quantity
      }
    }

    console.log("Items removed from cart:", cartData)
    res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng", cartData })
  } catch (error) {
    console.error("Error removing items from cart:", error)
    res.json({ success: false, message: "Lỗi khi xóa sản phẩm khỏi giỏ hàng" })
  }
}

export { addToCart, removeFromCart, removeFromCartAll, getCart, clearCart, updateCartQuantity, removeItemsFromCart }
