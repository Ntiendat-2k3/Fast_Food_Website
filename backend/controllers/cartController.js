import cartModel from "../models/cartModel.js"
import foodModel from "../models/foodModel.js"

// Get cart data
const getCart = async (req, res) => {
  try {
    console.log("Getting cart for user:", req.body.userId)

    // Find cart by userId
    const cart = await cartModel.findOne({ userId: req.body.userId }).populate("items.foodId")

    if (!cart) {
      return res.json({ success: true, cartData: {} })
    }

    // Convert cart items to the format expected by frontend
    const cartData = {}
    cart.items.forEach((item) => {
      if (item.foodId && item.foodId.name) {
        cartData[item.foodId.name] = item.quantity
      }
    })

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

    // Find the food item
    const food = await foodModel.findOne({ name: itemName })
    if (!food) {
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
    const existingItemIndex = cart.items.findIndex((item) => item.foodId.toString() === food._id.toString())

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        foodId: food._id,
        quantity: quantity,
        price: food.price,
      })
    }

    // Calculate total amount
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    cart.updatedAt = new Date()
    await cart.save()

    // Convert to frontend format
    const cartData = {}
    const populatedCart = await cartModel.findById(cart._id).populate("items.foodId")
    populatedCart.items.forEach((item) => {
      if (item.foodId && item.foodId.name) {
        cartData[item.foodId.name] = item.quantity
      }
    })

    console.log("Cart updated:", cartData)
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

    // Find the food item
    const food = await foodModel.findOne({ name: itemName })
    if (!food) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    // Find cart
    const cart = await cartModel.findOne({ userId })
    if (!cart) {
      return res.json({ success: true, cartData: {} })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex((item) => item.foodId.toString() === food._id.toString())

    if (itemIndex > -1) {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1
      } else {
        cart.items.splice(itemIndex, 1)
      }

      // Recalculate total
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)

      cart.updatedAt = new Date()
      await cart.save()
    }

    // Convert to frontend format
    const cartData = {}
    const populatedCart = await cartModel.findById(cart._id).populate("items.foodId")
    populatedCart.items.forEach((item) => {
      if (item.foodId && item.foodId.name) {
        cartData[item.foodId.name] = item.quantity
      }
    })

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

    // Find the food item
    const food = await foodModel.findOne({ name: itemName })
    if (!food) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    // Find cart
    const cart = await cartModel.findOne({ userId })
    if (!cart) {
      return res.json({ success: true, cartData: {} })
    }

    // Remove item completely
    cart.items = cart.items.filter((item) => item.foodId.toString() !== food._id.toString())

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    cart.updatedAt = new Date()
    await cart.save()

    // Convert to frontend format
    const cartData = {}
    const populatedCart = await cartModel.findById(cart._id).populate("items.foodId")
    populatedCart.items.forEach((item) => {
      if (item.foodId && item.foodId.name) {
        cartData[item.foodId.name] = item.quantity
      }
    })

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

    // Find the food item
    const food = await foodModel.findOne({ name: itemName })
    if (!food) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" })
    }

    // Find cart
    const cart = await cartModel.findOne({ userId })
    if (!cart) {
      return res.json({ success: true, cartData: {} })
    }

    if (quantity === 0) {
      // Remove item completely
      cart.items = cart.items.filter((item) => item.foodId.toString() !== food._id.toString())
    } else {
      // Find item in cart
      const itemIndex = cart.items.findIndex((item) => item.foodId.toString() === food._id.toString())

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity
      } else {
        // Add new item if not exists
        cart.items.push({
          foodId: food._id,
          quantity: quantity,
          price: food.price,
        })
      }
    }

    // Recalculate total
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    cart.updatedAt = new Date()
    await cart.save()

    // Convert to frontend format
    const cartData = {}
    const populatedCart = await cartModel.findById(cart._id).populate("items.foodId")
    populatedCart.items.forEach((item) => {
      if (item.foodId && item.foodId.name) {
        cartData[item.foodId.name] = item.quantity
      }
    })

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

    await cartModel.findOneAndDelete({ userId })
    console.log("Cart cleared successfully")

    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" })
  } catch (error) {
    console.error("Error clearing cart:", error)
    res.json({ success: false, message: "Lỗi khi xóa giỏ hàng" })
  }
}

export { addToCart, removeFromCart, removeFromCartAll, getCart, clearCart, updateCartQuantity }
