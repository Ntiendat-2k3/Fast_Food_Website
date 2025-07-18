"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { X, Upload, Tag, DollarSign, FileText, Save, ImageIcon } from "lucide-react"

const EditFoodModal = ({ food, url, onClose, onSuccess }) => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    id: food._id,
    name: food.name,
    description: food.description,
    price: food.price,
    category: food.category,
  })

  useEffect(() => {
    // Set image preview from existing food image
    setImagePreview(`${url}/images/${food.image}`)
    // Fetch categories
    fetchCategories()
  }, [food, url])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category/active`)
      if (response.data.success) {
        setCategories(response.data.data.map((cat) => cat.name))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Fallback to default categories including "Đồ uống"
      setCategories(["Burger", "Burito", "Gà", "Hot dog", "Pasta", "Salad", "Sandwich", "Tart", "Đồ uống"])
    }
  }

  // Handle input changes
  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setData((prevData) => ({ ...prevData, [name]: value }))
  }

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh")
        return
      }

      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove selected image
  const removeImage = () => {
    setImage(null)
    setImagePreview(`${url}/images/${food.image}`)
  }

  // Update the onSubmitHandler function to better handle errors
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("id", data.id)
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("price", Number(data.price))
    formData.append("category", data.category)

    if (image) {
      formData.append("image", image)
    }

    try {
      const response = await axios.post(`${url}/api/food/update`, formData)
      if (response.data.success) {
        toast.success(response.data.message)
        onSuccess()
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật sản phẩm")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-gray-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Chỉnh sửa sản phẩm</h2>
              <p className="text-gray-500 mt-1">Cập nhật thông tin sản phẩm của bạn</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-dark transition-all duration-200 hover:scale-105"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={onSubmitHandler} className="space-y-8">
            {/* Image Upload Section */}
            <div className="bg-gray-50 dark:bg-dark rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Hình ảnh sản phẩm</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Image Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Hình ảnh hiện tại
                  </label>
                  <div className="relative group">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Product preview"
                      className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600"
                    />
                    {image && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload New Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tải lên hình ảnh mới
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all duration-200 group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-primary">Nhấp để tải lên</span> hoặc kéo và thả
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG hoặc JPEG (Tối đa 5MB)</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-gray-50 dark:bg-dark rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Thông tin sản phẩm</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor="productName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Tên sản phẩm *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      onChange={onChangeHandler}
                      value={data.name}
                      type="text"
                      name="name"
                      id="productName"
                      placeholder="Nhập tên sản phẩm"
                      required
                      className="pl-12 block w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-dark py-4 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Product Category */}
                <div>
                  <label
                    htmlFor="productCategory"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Danh mục sản phẩm *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      onChange={onChangeHandler}
                      name="category"
                      id="productCategory"
                      value={data.category}
                      required
                      className="pl-12 block w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-dark py-4 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 appearance-none"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Product Price */}
                <div>
                  <label
                    htmlFor="productPrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Giá sản phẩm (VNĐ) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      onChange={onChangeHandler}
                      value={data.price}
                      type="number"
                      name="price"
                      id="productPrice"
                      placeholder="Nhập giá sản phẩm"
                      required
                      min="0"
                      step="1000"
                      className="pl-12 block w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-dark py-4 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Product Description */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor="productDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Mô tả sản phẩm *
                  </label>
                  <textarea
                    onChange={onChangeHandler}
                    value={data.description}
                    name="description"
                    id="productDescription"
                    rows="5"
                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-dark py-4 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-8 py-3 bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-all duration-200 hover:bg-gray-200 dark:hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-dark border-t-transparent"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditFoodModal
