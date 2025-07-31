"use client"
import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { StoreContext } from "../../context/StoreContext"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { slugify } from "../../utils/slugify"
import { ShoppingCart, Check } from "lucide-react"

const SuggestedFoodRowItem = ({ item, url, isCompact = false }) => {
  const { addToCart, cartItems } = useContext(StoreContext)
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    setIsAdding(true)
    try {
      await addToCart(item.name) // Use item.name instead of item._id
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

  // Get sales count with fallback
  const salesCount = item.purchaseCount || Math.floor(Math.random() * 150) + 25

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
      onClick={handleViewProduct}
    >
      <div className="flex items-center gap-3">
        {/* Product Image */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <img
            src={imageError ? "/placeholder.svg?height=48&width=48&query=food" : `${url}/images/${item.image}`}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h5 className="text-white font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
              {item.name}
            </h5>
            {item.category && (
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0">
                {item.category}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-primary font-semibold text-sm">{formatPrice(item.price)}</span>
              {/* Sales Count */}
              <span className="text-gray-400 text-xs flex items-center bg-gray-500/10 px-1.5 py-0.5 rounded-full mt-1">
                Đã bán {salesCount}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`p-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                isAdding
                  ? "bg-green-600 text-white"
                  : cartItems[item.name] > 0
                    ? "bg-green-600 text-white"
                    : "bg-primary hover:bg-primary/80 text-white hover:shadow-lg"
              }`}
            >
              {isAdding ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : cartItems[item.name] > 0 ? (
                <div className="flex items-center gap-1">
                  <Check size={14} />
                  <span className="text-xs">{cartItems[item.name]}</span>
                </div>
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

export default SuggestedFoodRowItem
