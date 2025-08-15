"use client"
import { motion } from "framer-motion"
import { ShoppingCart, Check } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { slugify } from "../../utils/slugify"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import ImageWithFallback from "../ui/ImageWithFallback"

const SuggestedFoodRowItem = ({ item, food }) => {
  const navigate = useNavigate()
  const { cartItems, addToCart, url } = useContext(StoreContext)

  const foodData = item || food

  if (!foodData) {
    console.error("❌ SuggestedFoodRowItem: No food data provided")
    return null
  }

  const handleAddToCartClick = (e) => {
    e.stopPropagation()
    addToCart(foodData._id, 1)
    toast.success(`Đã thêm ${foodData.name} vào giỏ hàng!`, { autoClose: 2000 })
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
      className="flex items-center bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleItemClick}
    >
      {/* Image */}
      <div className="relative flex-shrink-0 mr-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={url ? `${url}/images/${foodData.image}` : "/placeholder.svg"}
            alt={foodData.name || "Món ăn"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <h4 className="text-white font-medium text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
          {foodData.name || "Tên không xác định"}
        </h4>
        <p className="text-orange-400 font-semibold text-sm mt-0.5">{formatPrice(foodData.price)}</p>
        {foodData.purchaseCount && <p className="text-slate-400 text-xs mt-0.5">Đã bán {foodData.purchaseCount} lần</p>}
      </div>

      {/* Add to Cart Button */}
      <div className="flex-shrink-0 ml-3">
        <button
          onClick={handleAddToCartClick}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 w-8 h-8 rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
          title="Thêm vào giỏ hàng"
        >
          {cartItems[foodData._id] ? <Check size={14} /> : <ShoppingCart size={14} />}
        </button>
      </div>
    </motion.div>
  )
}

export default SuggestedFoodRowItem
