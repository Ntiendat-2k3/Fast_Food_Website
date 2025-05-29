"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { X, Upload, Tag, DollarSign, FileText, Save } from "lucide-react"

const EditFoodModal = ({ food, url, onClose, onSuccess }) => {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
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
  }, [food, url])

  // Handle input changes
  const onChangeHandler = (event) => {
    const { name, value } = event.target
    setData((prevData) => ({ ...prevData, [name]: value }))
  }

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Update the onSubmitHandler function to better handle errors
  const onSubmitHandler = async (event) => {
    event.preventDefault()
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
    }
  }

  const categories = ["Burger", "Burito", "Gà", "Hot dog", "Pasta", "Salad", "Sandwich", "Tart"]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sửa sản phẩm</h2>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-dark-lighter rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hình ảnh sản phẩm
              </label>
              <div className="flex items-center justify-center">
                <div className="w-full">
                  {imagePreview ? (
                    <div className="relative mb-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-64 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null)
                          setImagePreview(`${url}/images/${food.image}`)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-dark hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo và thả
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG hoặc JPEG (Tối đa 5MB)</p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label
                  htmlFor="productName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Tên sản phẩm
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                    className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Product Category */}
              <div>
                <label
                  htmlFor="productCategory"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Danh mục sản phẩm
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    onChange={onChangeHandler}
                    name="category"
                    id="productCategory"
                    value={data.category}
                    required
                    className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Price */}
              <div>
                <label
                  htmlFor="productPrice"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Giá sản phẩm
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    onChange={onChangeHandler}
                    value={data.price}
                    type="number"
                    name="price"
                    id="productPrice"
                    placeholder="Nhập giá"
                    required
                    className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <label
                htmlFor="productDescription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Thông tin chi tiết
              </label>
              <textarea
                onChange={onChangeHandler}
                value={data.description}
                name="description"
                id="productDescription"
                rows="4"
                placeholder="Nhập thông tin chi tiết"
                required
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-dark"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-dark font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <Save className="mr-2" size={20} />
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditFoodModal
