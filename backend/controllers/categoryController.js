import categoryModel from "../models/categoryModel.js"

// Default categories
const defaultCategories = [
  { name: "Burger", icon: "🍔", description: "Burger thơm ngon với patty tươi và topping đặc biệt", order: 1 },
  { name: "Burito", icon: "🌯", description: "Burito cuốn đầy đủ dinh dưỡng và hương vị Mexico", order: 2 },
  { name: "Gà", icon: "🍗", description: "Gà nướng, chiên giòn với gia vị bí mật", order: 3 },
  { name: "Hot dog", icon: "🌭", description: "Hotdog nướng thơm lừng với sốt đặc trưng", order: 4 },
  { name: "Pasta", icon: "🍝", description: "Pasta Ý chính gốc với sốt kem và cà chua", order: 5 },
  { name: "Salad", icon: "🥗", description: "Salad tươi mát với rau củ organic", order: 6 },
  { name: "Sandwich", icon: "🥪", description: "Sandwich thơm ngon với nhân đa dạng", order: 7 },
  { name: "Tart", icon: "🥧", description: "Tart ngọt ngào hoàn hảo cho bữa tráng miệng", order: 8 },
]

// Initialize default categories if none exist
const initializeDefaultCategories = async () => {
  try {
    const count = await categoryModel.countDocuments()
    if (count === 0) {
      await categoryModel.insertMany(defaultCategories)
      console.log("Default categories initialized")
    }
  } catch (error) {
    console.error("Error initializing default categories:", error)
  }
}

// Add category
const addCategory = async (req, res) => {
  try {
    const { name, icon, description, order } = req.body

    // Check if category already exists
    const existingCategory = await categoryModel.findOne({ name })
    if (existingCategory) {
      return res.json({ success: false, message: "Danh mục đã tồn tại" })
    }

    const category = new categoryModel({
      name,
      icon,
      description,
      order: order || 0,
    })

    await category.save()
    res.json({ success: true, message: "Thêm danh mục thành công", data: category })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi thêm danh mục" })
  }
}

// Get all categories
const listCategories = async (req, res) => {
  try {
    // Initialize default categories if none exist
    await initializeDefaultCategories()

    const categories = await categoryModel.find({}).sort({ order: 1, name: 1 })
    res.json({ success: true, data: categories })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách danh mục" })
  }
}

// Get active categories only
const getActiveCategories = async (req, res) => {
  try {
    // Initialize default categories if none exist
    await initializeDefaultCategories()

    const categories = await categoryModel.find({ isActive: true }).sort({ order: 1, name: 1 })
    res.json({ success: true, data: categories })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi lấy danh sách danh mục" })
  }
}

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params
    const category = await categoryModel.findById(id)

    if (!category) {
      return res.json({ success: false, message: "Không tìm thấy danh mục" })
    }

    res.json({ success: true, data: category })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi lấy thông tin danh mục" })
  }
}

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id, name, icon, description, isActive, order } = req.body

    // Check if another category with same name exists
    const existingCategory = await categoryModel.findOne({ name, _id: { $ne: id } })
    if (existingCategory) {
      return res.json({ success: false, message: "Tên danh mục đã tồn tại" })
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      {
        name,
        icon,
        description,
        isActive,
        order,
        updatedAt: Date.now(),
      },
      { new: true },
    )

    if (!updatedCategory) {
      return res.json({ success: false, message: "Không tìm thấy danh mục" })
    }

    res.json({ success: true, message: "Cập nhật danh mục thành công", data: updatedCategory })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi cập nhật danh mục" })
  }
}

// Delete category
const removeCategory = async (req, res) => {
  try {
    const { id } = req.body

    // Check if category has products
    const foodModel = (await import("../models/foodModel.js")).default
    const productsCount = await foodModel.countDocuments({ category: id })

    if (productsCount > 0) {
      return res.json({
        success: false,
        message: `Không thể xóa danh mục này vì có ${productsCount} sản phẩm đang sử dụng`,
      })
    }

    const deletedCategory = await categoryModel.findByIdAndDelete(id)

    if (!deletedCategory) {
      return res.json({ success: false, message: "Không tìm thấy danh mục" })
    }

    res.json({ success: true, message: "Xóa danh mục thành công" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi xóa danh mục" })
  }
}

// Toggle category status
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.body

    const category = await categoryModel.findById(id)
    if (!category) {
      return res.json({ success: false, message: "Không tìm thấy danh mục" })
    }

    category.isActive = !category.isActive
    category.updatedAt = Date.now()
    await category.save()

    res.json({
      success: true,
      message: `${category.isActive ? "Kích hoạt" : "Vô hiệu hóa"} danh mục thành công`,
      data: category,
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Lỗi khi thay đổi trạng thái danh mục" })
  }
}

export {
  addCategory,
  listCategories,
  getActiveCategories,
  getCategoryById,
  updateCategory,
  removeCategory,
  toggleCategoryStatus,
}
