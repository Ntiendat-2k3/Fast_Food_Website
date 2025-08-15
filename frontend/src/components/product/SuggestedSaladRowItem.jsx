"use client"

import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { StoreContext } from "../../context/StoreContext"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { slugify } from "../../utils/slugify"
import { ShoppingCart, Check, Leaf } from "lucide-react"

const SuggestedSaladRowItem = ({ item, url, isCompact = false }) => {
  const { addToCart, cartItems } = useContext(StoreContext)
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    setIsAdding(true)
    try {
      addToCart(item._id, 1)
      toast.success(`Đã thêm ${item.name} vào giỏ hàng`)
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng")
    } finally {
      setTimeout(() => setIsAdding(false), 500)
    }
  }

  const handleViewProduct = () => {
    const slug = slugify(item.name)
    navigate(`/product/${slug}`)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ"
  }

  // const purchaseCount = item.purchaseCount || Math.floor(Math.random() * 100) + 15

  const isInCart = Boolean(cartItems[item._id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2 }}
      className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 hover:border-green-400/50 transition-all duration-300 cursor-pointer group"
      onClick={handleViewProduct}
    >
      <div className="flex items-center gap-3">
        {/* Product Image */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <img
            src={imageError ? "/placeholder.svg?height=48&width=48&query=salad" : `${url}/images/${item.image}`}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <Leaf size={8} className="text-white" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h5 className="text-white font-medium text-sm group-hover:text-green-400 transition-colors line-clamp-1">
              {item.name}
            </h5>
            {item.category && (
              <span className="bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0">
                {item.category}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-green-400 font-semibold text-sm">{formatPrice(item.price)}</span>
              <span className="text-gray-400 text-xs flex items-center">
                <Leaf size={8} className="mr-1 text-green-400" />
                {/* Đã bán {purchaseCount} */}
              </span>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`p-2 rounded-full font-medium text-xs transition-all duration-200 flex-shrink-0 ${
                isAdding || isInCart
                  ? "bg-green-600 text-white"
                  : "bg-green-500 hover:bg-green-400 text-white hover:shadow-lg"
              }`}
            >
              {isAdding ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isInCart ? (
                <Check size={14} />
              ) : (
                <ShoppingCart size={14} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SuggestedSaladRowItem
