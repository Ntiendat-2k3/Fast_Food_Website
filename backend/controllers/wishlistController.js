import wishlistModel from "../models/wishlistModel.js"

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { foodId } = req.body
    const userId = req.body.userId

    // Check if already in wishlist
    const existingItem = await wishlistModel.findOne({ userId, foodId })
    if (existingItem) {
      return res.json({ success: false, message: "Sản phẩm đã có trong danh sách yêu thích" })
    }

    const wishlistItem = new wishlistModel({
      userId,
      foodId,
    })

    await wishlistItem.save()
    res.json({ success: true, message: "Đã thêm vào danh sách yêu thích" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error adding to wishlist" })
  }
}

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { foodId } = req.body
    const userId = req.body.userId

    await wishlistModel.findOneAndDelete({ userId, foodId })
    res.json({ success: true, message: "Đã xóa khỏi danh sách yêu thích" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error removing from wishlist" })
  }
}

// Get user wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.body.userId

    const wishlistItems = await wishlistModel.find({ userId }).populate("foodId").sort({ createdAt: -1 })

    // Filter out items where foodId is null (deleted foods)
    const validItems = wishlistItems.filter((item) => item.foodId)

    res.json({ success: true, data: validItems })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error getting wishlist" })
  }
}

// Check if item is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const { foodId } = req.params
    const userId = req.body.userId

    const item = await wishlistModel.findOne({ userId, foodId })
    res.json({ success: true, isInWishlist: !!item })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error checking wishlist" })
  }
}

export { addToWishlist, removeFromWishlist, getWishlist, checkWishlist }
