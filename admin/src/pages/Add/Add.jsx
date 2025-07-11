"use client"

import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Save } from "lucide-react"
import ProductForm from "../../components/add/ProductForm"

const Add = ({ url }) => {
  const [image, setImage] = useState(false)
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
  const handleImageChange = (file) => {
    setImage(file)
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
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message || "Lỗi khi thêm sản phẩm")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm. Vui lòng thử lại sau.")
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center">
          <Save className="mr-2" size={24} />
          Thêm sản phẩm mới
        </h1>

        <ProductForm
          data={data}
          onChangeHandler={onChangeHandler}
          onImageChange={handleImageChange}
          onSubmit={onSubmitHandler}
          url={url}
        />
      </div>
    </div>
  )
}

export default Add
