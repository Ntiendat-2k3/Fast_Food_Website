"use client"

import { useContext, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ShoppingCart, Minus, Plus, CreditCard } from "lucide-react"

const FoodDetail = () => {
  useEffect(() => {
    window.scrollTo(0, 70)
  }, [])

  const { id } = useParams()
  const { cartItems, addToCart, removeFromCart, url, setCartItems } = useContext(StoreContext)
  const { food_list } = useContext(StoreContext)
  const navigate = useNavigate()

  // State quản lý số lượng
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    if (foodItem) {
      addToCart(foodItem.name, quantity)
      toast.success("Đã thêm vào giỏ hàng", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  const handlePayment = () => {
    if (foodItem) {
      // Clear the cart first
      setCartItems({})
      // Then add only this product
      addToCart(foodItem.name, quantity)
      navigate("/order")
    }
  }

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const foodItem = food_list.find((item) => item._id === id)

  if (!foodItem) {
    return (
      <div className="flex justify-center items-center h-64 pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-300">Không tìm thấy món ăn</h2>
          <button
            onClick={() => navigate("/foods")}
            className="mt-4 bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-lg transition-colors"
          >
            Quay lại thực đơn
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-lg mt-20 mx-4 md:mx-auto max-w-6xl transition-colors duration-300">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <div className="h-64 md:h-full">
            <img
              src={url + "/images/" + foodItem.image || "/placeholder.svg"}
              alt={foodItem.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="md:w-1/2 p-6 md:p-8">
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-4">{foodItem.name}</h1>
          <div className="bg-gray-50 dark:bg-dark-light p-4 rounded-lg mb-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{foodItem.description}</p>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-3xl font-bold text-primary">{foodItem.price.toLocaleString("vi-VN")} đ</span>
          </div>

          <div className="mb-6">
            <label className="block text-dark dark:text-gray-300 mb-2 font-medium">Số lượng</label>
            <div className="flex items-center">
              <button
                onClick={decreaseQuantity}
                className="w-10 h-10 rounded-l-lg bg-gray-100 dark:bg-dark-light text-dark dark:text-white flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Minus size={18} />
              </button>
              <div className="w-16 h-10 bg-gray-100 dark:bg-dark-light flex items-center justify-center text-dark dark:text-white font-medium">
                {quantity}
              </div>
              <button
                onClick={increaseQuantity}
                className="w-10 h-10 rounded-r-lg bg-gray-100 dark:bg-dark-light text-dark dark:text-white flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handlePayment}
              className="bg-primary hover:bg-primary-light text-dark py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
            >
              <CreditCard size={20} className="mr-2" />
              Mua ngay
            </button>
            <button
              onClick={handleAddToCart}
              className="border border-primary text-primary dark:text-primary-lighter hover:bg-primary hover:text-dark py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
            >
              <ShoppingCart size={20} className="mr-2" />
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default FoodDetail
