"use client"

import { motion } from "framer-motion"
import { Star, Trash2, Plus } from "lucide-react"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import { slugify } from "../../utils/slugify"
import { toast } from "react-toastify"

const WishlistItem = ({ item, index, onRemove, ratings }) => {
  const { url, addToCart } = useContext(StoreContext)
  const navigate = useNavigate()

  const handleProductClick = () => {
    navigate(`/product/${slugify(item.foodId.name)}`)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(item.foodId.name, 1)
    toast.success("Đã thêm vào giỏ hàng")
  }

  return (
    <motion.div
      key={item._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-primary/50 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={`${url}/images/${item.foodId.image}`}
          alt={item.foodId.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={handleProductClick}
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-full p-2 shadow-md">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-xs font-medium ml-1 text-white">
                {ratings[item.foodId._id] ? ratings[item.foodId._id].toFixed(1) : "0.0"}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(item.foodId._id)
            }}
            className="bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Xóa khỏi yêu thích"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-5">
        <h3
          className="text-lg font-bold text-white mb-1 truncate cursor-pointer hover:text-primary transition-colors"
          onClick={handleProductClick}
        >
          {item.foodId.name}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{item.foodId.description}</p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-bold text-primary">{item.foodId.price.toLocaleString("vi-VN")} đ</span>
          <button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Thêm vào giỏ hàng"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="text-xs text-gray-400 border-t border-slate-600 pt-3">
          Đã thêm: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
        </div>
      </div>
    </motion.div>
  )
}

export default WishlistItem
