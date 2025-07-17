"use client"
import { motion } from "framer-motion"
import { ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { slugify } from "../../utils/slugify"

const SuggestedDrinkRowItem = ({ item, url, addToCart }) => {
  const navigate = useNavigate()

  const handleAddToCartClick = (e) => {
    e.stopPropagation()
    addToCart(item.name, 1)
    toast.success(`Đã thêm ${item.name} vào giỏ hàng!`, { autoClose: 2000 })
  }

  return (
    <motion.div
      className="flex items-center bg-slate-800/50 backdrop-blur-xl rounded-lg p-3 border border-slate-700 hover:border-primary/50 transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 5 }}
      onClick={() => navigate(`/product/${slugify(item.name)}`)}
    >
      <img
        src={url + "/images/" + item.image || "/placeholder.svg"}
        alt={item.name}
        className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0"
      />
      <div className="flex-grow">
        <h4 className="text-lg font-semibold text-white line-clamp-1">{item.name}</h4>
        <p className="text-primary font-bold text-md mt-1">{item.price.toLocaleString("vi-VN")} đ</p>
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
