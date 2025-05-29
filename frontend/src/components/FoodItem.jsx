"use client"

import { useContext, useState } from "react"
import { StoreContext } from "../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Star, Check } from "lucide-react"
import { motion } from "framer-motion"
import { slugify } from "../utils/slugify"

function FoodItem({ name, price, description, image, index, _id, rating = 0, totalReviews = 0 }) {
  const { url, addToCart } = useContext(StoreContext)
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)

  const handleClick = () => {
    navigate(`/product/${slugify(name)}`)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    setIsAdding(true)
    addToCart(name, 1)

    setTimeout(() => {
      setIsAdding(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-dark-lighter cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={url + "/images/" + image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {totalReviews > 0 && (
          <div className="absolute top-2 right-2 bg-white dark:bg-dark-lighter rounded-full p-1 shadow-sm">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium ml-1 text-dark dark:text-white">{rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-dark dark:text-white mb-1 truncate">{name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-1">{description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xl font-bold text-primary">{price?.toLocaleString("vi-VN") || 0} đ</span>
          <button
            onClick={handleAddToCart}
            className={`${
              isAdding ? "bg-green-500" : "bg-primary"
            } hover:opacity-90 text-white p-2 rounded-full transition-colors`}
            type="button"
            aria-label="Thêm vào giỏ hàng"
          >
            {isAdding ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default FoodItem
