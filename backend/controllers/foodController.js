import foodModel from "../models/foodModel.js"
import fs from "fs"
import mongoose from "mongoose"

const addFood = async (req, res) => {
  const image_filename = `${req.file.filename}`

  const food = new foodModel({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  })
  try {
    await food.save()
    res.json({ success: true, message: "Đã thêm món" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// all food list
const listFood = async (req, res) => {
  try {
    const category = req.query.category
    const query = {}

    if (category && category !== "Tất cả") {
      query.category = category
    }

    const foods = await foodModel.find(query)
    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

//tìm kiếm food
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
    const foodId = req.params.id
    const food = await foodModel.findById(foodId)

    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
    }

    res.json({ success: true, data: food })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// Update food item
const updateFood = async (req, res) => {
  try {
    const foodId = req.body.id
    const food = await foodModel.findById(foodId)

    if (!food) {
      return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
    }

    // Update fields
    food.name = req.body.name || food.name
    food.description = req.body.description || food.description
    food.price = req.body.price || food.price
    food.category = req.body.category || food.category

    // If there's a new image
    if (req.file) {
      // Delete old image
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err) console.log("Error deleting old image:", err)
      })

      // Set new image
      food.image = req.file.filename
    }

    await food.save()
    res.json({ success: true, message: "Đã cập nhật sản phẩm" })
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
    res.json({ success: true, message: "Đã xóa món" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

export { addFood, listFood, searchFood, getFoodById, updateFood, removeFood }
