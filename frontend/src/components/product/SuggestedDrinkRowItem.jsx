"use client"
import { motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { slugify } from "../../utils/slugify"

const SuggestedDrinkRowItem = ({ item, drink, url, addToCart, onAddToCart }) => {
  const navigate = useNavigate()

  // Use either item or drink prop (for backward compatibility)
  const drinkData = item || drink

  console.log("SuggestedDrinkRowItem props:", { item, drink, drinkData })

  if (!drinkData) {
    console.error("❌ SuggestedDrinkRowItem: No drink data provided")
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-center">
        <span className="text-red-400 text-sm">❌ Không có dữ liệu đồ uống</span>
      </div>
    )
  }

  const handleAddToCartClick = (e) => {
    e.stopPropagation()

    if (onAddToCart) {
      onAddToCart(drinkData.name)
    } else if (addToCart) {
      addToCart(drinkData.name, 1)
      toast.success(`Đã thêm ${drinkData.name} vào giỏ hàng!`, { autoClose: 2000 })
    } else {
      console.error("❌ No addToCart function provided")
      toast.error("Không thể thêm vào giỏ hàng")
    }
  }

  const handleItemClick = () => {
    if (drinkData.name) {
      navigate(`/product/${slugify(drinkData.name)}`)
    }
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
      <img
        src={url ? `${url}/images/${drinkData.image}` : "/placeholder.svg"}
        alt={drinkData.name || "Đồ uống"}
        className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0"
        onError={(e) => {
          e.target.src = "/placeholder.svg?height=64&width=64"
        }}
      />
      <div className="flex-grow">
        <h4 className="text-lg font-semibold text-white line-clamp-1">{drinkData.name || "Tên không xác định"}</h4>
        <p className="text-primary font-bold text-md mt-1">
          {drinkData.price ? `${drinkData.price.toLocaleString("vi-VN")} đ` : "Giá chưa cập nhật"}
        </p>
        {drinkData.purchaseCount && <p className="text-slate-400 text-xs mt-1">Đã bán {drinkData.purchaseCount} lần</p>}
      </div>
      <motion.button
        onClick={handleAddToCartClick}
        className="bg-primary text-slate-900 p-2 rounded-full transition-colors hover:bg-primary-dark ml-4 flex-shrink-0"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ShoppingCart size={18} />
      </motion.button>
    </motion.div>
  )
}

export default SuggestedDrinkRowItem
