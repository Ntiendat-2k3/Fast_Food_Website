"use client"

import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Upload, Tag, DollarSign, FileText, Save, X } from "lucide-react"

const Add = ({ url }) => {
  const [image, setImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  })

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
    formData.append("name", data.name)
    formData.append("description", data.description)
    formData.append("price", Number(data.price))
    formData.append("category", data.category)
    formData.append("image", image)

    try {
      const response = await axios.post(`${url}/api/food/add`, formData)
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "",
        })
        setImage(false)
        setImagePreview(null)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message || "Lỗi khi thêm sản phẩm")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm. Vui lòng thử lại sau.")
    }
  }

  const categories = ["Burger", "Burito", "Gà", "Hot dog", "Pasta", "Salad", "Sandwich", "Tart"]

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center">
          <Save className="mr-2" size={24} />
          Thêm sản phẩm mới
        </h1>

        <form onSubmit={onSubmitHandler} className="space-y-4 md:space-y-6">
          {/* Image Upload Section */}
          <div className="mb-4 md:mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình ảnh sản phẩm</label>
            <div className="flex items-center justify-center">
              <div className="w-full">
                {imagePreview ? (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-48 md:h-56 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(false)
                        setImagePreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 md:h-56 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-dark hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors">
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
                      required
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
                  className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Product Category */}
            <div>
              <label
                htmlFor="productCategory"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
                  className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Chọn danh mục</option>
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
                  className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-4">
            <label
              htmlFor="productDescription"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-4 md:mt-6">
            <button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-dark font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <Save className="mr-2" size={20} />
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Add
