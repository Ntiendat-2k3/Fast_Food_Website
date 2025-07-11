import foodModel from "../models/foodModel.js"
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

    // Add category filter if provided
    if (category && category.trim() !== "") {
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
    const foods = await foodModel.find({ category })
    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
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
    if (food && food.image) {
      fs.unlink(`uploads/${food.image}`, () => {})
    }

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

export { addFood, listFood, searchFood, removeFood, updateFood, getFoodByCategory, getFoodById, removeMultipleFood }
