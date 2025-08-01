"use client"
import { motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { slugify } from "../../utils/slugify"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import ImageWithFallback from "../ui/ImageWithFallback"
import PriceDisplay from "../ui/PriceDisplay"

const SuggestedFoodRowItem = ({ item, food }) => {
  const navigate = useNavigate()
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)

  // Use either item or food prop (for backward compatibility)
  const foodData = item || food

  if (!foodData) {
    console.error("❌ SuggestedFoodRowItem: No food data provided")
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center">
        <span className="text-red-400 text-sm">❌ Không có dữ liệu món ăn</span>
      </div>
    )
  }

  const handleAddToCartClick = (e) => {
    e.stopPropagation()

    if (cartItems[foodData._id]) {
      removeFromCart(foodData._id)
    } else {
      addToCart(foodData._id)
      toast.success(`Đã thêm ${foodData.name} vào giỏ hàng!`, { autoClose: 2000 })
    }
  }

  const handleItemClick = () => {
    if (foodData.name) {
      navigate(`/product/${slugify(foodData.name)}`)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <motion.div
      className="flex items-center bg-slate-800/50 backdrop-blur-xl rounded-lg p-3 border border-slate-700 hover:border-primary/50 transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 5 }}
      onClick={handleItemClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <ImageWithFallback
          src={url ? `${url}/images/${foodData.image}` : "/placeholder.svg"}
          alt={foodData.name || "Món ăn"}
          className="w-16 h-16 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Purchase Count Badge */}
        {foodData.purchaseCount && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Đã bán {foodData.purchaseCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow">
        {/* Food Name */}
        <h4 className="text-lg font-semibold text-white line-clamp-1 mb-1 group-hover:text-orange-600 transition-colors">
          {foodData.name || "Tên không xác định"}
        </h4>

        {/* Category */}
        {foodData.category && (
          <p className="text-slate-400 text-sm mt-1 bg-gray-50 px-2 py-1 rounded-full inline-block">
            {foodData.category}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <PriceDisplay price={foodData.price} className="text-primary font-bold text-md" />

          {/* Add to Cart Button */}
          <div className="flex items-center">
            {!cartItems[foodData._id] ? (
              <button
                onClick={handleAddToCartClick}
                className="bg-primary hover:bg-primary-dark text-slate-900 p-2 rounded-full transition-colors duration-200 flex items-center justify-center"
                title="Thêm vào giỏ hàng"
              >
                <ShoppingCart size={18} />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => removeFromCart(foodData._id)}
                  className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                  title="Giảm số lượng"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium min-w-[24px] text-center">
                  {cartItems[foodData._id]}
                </span>

                <button
                  onClick={handleAddToCartClick}
                  className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                  title="Tăng số lượng"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description (if available) */}
        {foodData.description && foodData.description !== foodData.name && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{foodData.description}</p>
        )}
      </div>
    </motion.div>
  )
}

export default SuggestedFoodRowItem