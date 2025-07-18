"use client"

import { motion } from "framer-motion"
import { Star, Check, Minus, Plus, CreditCard, ShoppingCart, Truck, ShieldCheck, RefreshCw } from "lucide-react"
import SuggestedDrinks from "./SuggestedDrinks"

const ProductInfo = ({
  product,
  quantity,
  increaseQuantity,
  decreaseQuantity,
  handleBuyNow,
  handleAddToCart,
  ratingStats,
  suggestedDrinks,
  isLoadingSuggestedDrinks,
  relatedRatings,
}) => {
  return (
    <div className="space-y-6">
      {/* Rating and Reviews */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center flex-wrap gap-4"
      >
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              className={i < Math.floor(ratingStats.averageRating) ? "text-primary fill-primary" : "text-gray-500"}
            />
          ))}
        </div>
        <span className="text-gray-300 text-sm">
          {ratingStats.totalReviews > 0
            ? `${ratingStats.averageRating.toFixed(1)} (${ratingStats.totalReviews} đánh giá)`
            : "Chưa có đánh giá"}
        </span>
        <span className="text-green-400 text-sm flex items-center bg-green-500/10 px-2 py-1 rounded-full">
          <Check size={14} className="mr-1" /> Đã bán 120+
        </span>
      </motion.div>

      {/* Product Name */}
      <motion.h1
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl lg:text-4xl font-bold text-white leading-tight"
      >
        {product.name}
      </motion.h1>

      {/* Price */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-4"
      >
        <span className="text-3xl lg:text-4xl font-bold text-primary">{product.price.toLocaleString("vi-VN")} đ</span>
        {Math.random() > 0.5 && (
          <span className="text-xl text-gray-500 line-through">
            {(product.price * 1.2).toFixed(0).toLocaleString("vi-VN")} đ
          </span>
        )}
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-700/50 p-4 rounded-xl border border-slate-600"
      >
        <p className="text-gray-300 leading-relaxed">{product.description}</p>
      </motion.div>

      {/* Quantity Selector */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-white font-medium">Số lượng</label>
          <span className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded-full">Còn hàng</span>
        </div>
        <div className="flex items-center bg-slate-700/50 rounded-xl border border-slate-600 w-fit">
          <motion.button
            onClick={decreaseQuantity}
            className="w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Minus size={18} />
          </motion.button>
          <div className="w-16 h-12 flex items-center justify-center text-white font-semibold">{quantity}</div>
          <motion.button
            onClick={increaseQuantity}
            className="w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <motion.button
          onClick={handleBuyNow}
          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CreditCard size={20} />
          Mua ngay
        </motion.button>
        <motion.button
          onClick={handleAddToCart}
          className="border-2 border-primary text-primary hover:bg-primary hover:text-slate-900 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShoppingCart size={20} />
          Thêm vào giỏ
        </motion.button>
      </motion.div>

      {product.category !== "Đồ uống" && suggestedDrinks && suggestedDrinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75 }}
          className="mt-6 pt-6 border-t border-slate-700"
        >
          <SuggestedDrinks productCategory={product.category} isCompact={true} />
        </motion.div>
      )}

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }} // Adjusted delay
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="flex items-center bg-slate-700/30 p-3 rounded-xl">
          <div className="p-2 bg-primary/20 rounded-full mr-3">
            <Truck size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Giao hàng miễn phí</p>
            <p className="text-xs text-gray-400">Cho đơn từ 200k</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-700/30 p-3 rounded-xl">
          <div className="p-2 bg-primary/20 rounded-full mr-3">
            <ShieldCheck size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Đảm bảo chất lượng</p>
            <p className="text-xs text-gray-400">100% nguyên liệu sạch</p>
          </div>
        </div>
        <div className="flex items-center bg-slate-700/30 p-3 rounded-xl">
          <div className="p-2 bg-primary/20 rounded-full mr-3">
            <RefreshCw size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Đổi trả dễ dàng</p>
            <p className="text-xs text-gray-400">Trong vòng 24h</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProductInfo
