"use client"

import { motion } from "framer-motion"
import { Star, Eye, ShoppingCart } from "lucide-react"
import { toast } from "react-toastify"
import { slugify } from "../../utils/slugify"

const RelatedProductCard = ({ item, index, url, relatedRatings, navigate, addToCart }) => {
  return (
    <motion.div
      key={item.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 + index * 0.1 }}
      className="group bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-700 hover:border-primary/50 cursor-pointer"
      onClick={() => navigate(`/product/${slugify(item.name)}`)}
      whileHover={{ y: -4 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={url + "/images/" + item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full p-2 border border-white/20">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-xs font-medium ml-1 text-white">
              {relatedRatings[item._id] ? relatedRatings[item._id].toFixed(1) : "0.0"}
            </span>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/product/${slugify(item.name)}`)
            }}
            className="bg-primary text-slate-900 p-3 rounded-full font-semibold transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Eye size={20} />
          </motion.button>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary">{item.price.toLocaleString("vi-VN")} đ</span>
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              addToCart(item.name, 1)
              toast.success("Đã thêm vào giỏ hàng", { autoClose: 2000 })
            }}
            className="bg-primary hover:bg-primary-dark text-slate-900 p-2 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingCart size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default RelatedProductCard
