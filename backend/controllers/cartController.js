import userModel from "../models/userModel.js"

// Get cart data
const getCart = async (req, res) => {
  try {
    console.log("Getting cart for user:", req.body.userId)

    const userData = await userModel.findById(req.body.userId)
    if (!userData) {
      return res.json({ success: false, message: "User not found" })
    }

    const cartData = userData.cartData || {}
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
    const { userId, itemName, quantity = 1 } = req.body
    console.log("Adding to cart:", { userId, itemName, quantity })

    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "User not found" })
    }

    // Initialize cartData if it doesn't exist
    const cartData = userData.cartData || {}

    // Add or update item quantity
    if (!cartData[itemName]) {
      cartData[itemName] = quantity
    } else {
      cartData[itemName] += quantity
    }

    // Save to database
    await userModel.findByIdAndUpdate(userId, { cartData })
    console.log("Cart updated in database:", cartData)

    res.json({ success: true, message: "Đã thêm vào giỏ hàng", cartData })
  } catch (error) {
    console.error("Error adding to cart:", error)
    res.json({ success: false, message: "Lỗi khi thêm vào giỏ hàng" })
  }
}

// Remove one item from cart
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemName } = req.body
    console.log("Removing from cart:", { userId, itemName })

    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "User not found" })
    }

    // Initialize cartData if it doesn't exist
    const cartData = userData.cartData || {}

    if (cartData[itemName] && cartData[itemName] > 0) {
      cartData[itemName] -= 1

      // Remove item completely if quantity becomes 0
      if (cartData[itemName] === 0) {
        delete cartData[itemName]
      }
    }

    // Save to database
    await userModel.findByIdAndUpdate(userId, { cartData })
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
    const { userId, itemName } = req.body
    console.log("Removing all from cart:", { userId, itemName })

    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "User not found" })
    }

    // Initialize cartData if it doesn't exist
    const cartData = userData.cartData || {}

    // Remove item completely
    if (cartData[itemName]) {
      delete cartData[itemName]
    }

    // Save to database
    await userModel.findByIdAndUpdate(userId, { cartData })
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
    const { userId, itemName, quantity } = req.body
    console.log("Updating cart quantity:", { userId, itemName, quantity })

    if (quantity < 0) {
      return res.json({ success: false, message: "Số lượng không hợp lệ" })
    }

    const userData = await userModel.findById(userId)
    if (!userData) {
      return res.json({ success: false, message: "User not found" })
    }

    // Initialize cartData if it doesn't exist
    const cartData = userData.cartData || {}

    if (quantity === 0) {
      // Remove item if quantity is 0
      delete cartData[itemName]
    } else {
      // Update quantity
      cartData[itemName] = quantity
    }

    // Save to database
    await userModel.findByIdAndUpdate(userId, { cartData })
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
    const { userId } = req.body
    console.log("Clearing cart for user:", userId)

    await userModel.findByIdAndUpdate(userId, { cartData: {} })
    console.log("Cart cleared successfully")

    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" })
  } catch (error) {
    console.error("Error clearing cart:", error)
    res.json({ success: false, message: "Lỗi khi xóa giỏ hàng" })
  }
}

export { addToCart, removeFromCart, removeFromCartAll, getCart, clearCart, updateCartQuantity }
