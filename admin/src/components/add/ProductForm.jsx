"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { FileText, Tag, DollarSign, Save } from "lucide-react"
import FormField from "./FormField"
import FormSelect from "./FormSelect"
import ImageUploader from "./ImageUploader"

const ProductForm = ({ data, onChangeHandler, onImageChange, onSubmit, url }) => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/category/active`)
      if (response.data.success) {
        setCategories(response.data.data.map((cat) => cat.name))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Fallback to default categories
      setCategories(["Burger", "Burito", "Gà", "Hot dog", "Pasta", "Salad", "Sandwich", "Tart"])
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
      <ImageUploader onImageChange={onImageChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        <FormField
          label="Tên sản phẩm"
          icon={<FileText className="h-5 w-5 text-gray-400" />}
          name="name"
          value={data.name}
          onChange={onChangeHandler}
          placeholder="Nhập tên sản phẩm"
          required
        />

        <FormSelect
          label="Danh mục sản phẩm"
          icon={<Tag className="h-5 w-5 text-gray-400" />}
          name="category"
          value={data.category}
          onChange={onChangeHandler}
          options={categories}
          required
        />

        <FormField
          label="Giá sản phẩm"
          icon={<DollarSign className="h-5 w-5 text-gray-400" />}
          name="price"
          type="number"
          value={data.price}
          onChange={onChangeHandler}
          placeholder="Nhập giá"
          required
        />
      </div>

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

      <div className="mt-4 md:mt-6">
        <button
          type="submit"
          className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          <Save className="mr-2" size={20} />
          Thêm sản phẩm
        </button>
      </div>
    </form>
  )
}

export default ProductForm
