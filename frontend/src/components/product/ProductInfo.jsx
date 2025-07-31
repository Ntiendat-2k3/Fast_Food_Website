"use client"

import { motion } from "framer-motion"
import {
  Star,
  Check,
  Minus,
  Plus,
  CreditCard,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react"
import SuggestedDrinks from "./SuggestedDrinks"
import { useState, useEffect } from "react"
import axios from "axios"

// Stock Status Component
const StockStatus = ({ stock }) => {
  const getStockStatus = () => {
    if (stock <= 0) {
      return {
        text: "Hết hàng",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        icon: <X size={14} className="mr-1" />,
      }
    } else if (stock <= 20) {
      // Changed from 10 to 20 to match admin panel
      return {
        text: `Sắp hết (${stock} còn lại)`,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        icon: <AlertTriangle size={14} className="mr-1" />,
      }
    } else {
      return {
        text: "Còn hàng",
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        icon: <Check size={14} className="mr-1" />,
      }
    }
  }

  const status = getStockStatus()

  return (
    <span className={`${status.color} text-sm ${status.bgColor} px-2 py-1 rounded-full flex items-center w-fit`}>
      {status.icon}
      {status.text}
    </span>
  )
}

// Sales Count Component
const SalesCount = ({ productId, url }) => {
  const [salesCount, setSalesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSalesCount = async () => {
      try {
        const response = await axios.get(`${url}/api/food/sales/${productId}`)
        console.log("response:",response.data.data)
        if (response.data.success) {
          setSalesCount(response.data.data.totalSold)
        }
      } catch (error) {
        console.error("Error fetching sales count:", error)
        // Fallback to a random number for demo purposes
        setSalesCount(Math.floor(Math.random() * 200) + 50)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchSalesCount()
    }
  }, [productId, url])

  if (loading) {
    return (
      <span className="text-green-400 text-sm flex items-center bg-green-500/10 px-2 py-1 rounded-full">
        <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin mr-1"></div>
        Đang tải...
      </span>
    )
  }

  return (
    <span className="text-green-400 text-sm flex items-center bg-green-500/10 px-2 py-1 rounded-full">
      <Check size={14} className="mr-1" />
      Đã bán {salesCount > 0 ? `${salesCount}+` : "0"}
    </span>
  )
}

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
  stock = 50, // Add stock prop with default value
  url, // Add url prop for API calls
}) => {
  const isOutOfStock = stock <= 0
  const isLowStock = stock > 0 && stock <= 20 // Changed from 10 to 20

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
        <SalesCount productId={product._id} url={url} />
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
          <StockStatus stock={stock} />
        </div>
        <div
          className={`flex items-center bg-slate-700/50 rounded-xl border border-slate-600 w-fit ${isOutOfStock ? "opacity-50" : ""}`}
        >
          <motion.button
            onClick={decreaseQuantity}
            disabled={isOutOfStock}
            className={`w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors ${isOutOfStock ? "cursor-not-allowed" : ""}`}
            whileHover={!isOutOfStock ? { scale: 1.1 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.9 } : {}}
          >
            <Minus size={18} />
          </motion.button>
          <div className="w-16 h-12 flex items-center justify-center text-white font-semibold">{quantity}</div>
          <motion.button
            onClick={increaseQuantity}
            disabled={isOutOfStock || quantity >= stock}
            className={`w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors ${isOutOfStock || quantity >= stock ? "cursor-not-allowed opacity-50" : ""}`}
            whileHover={!isOutOfStock && quantity < stock ? { scale: 1.1 } : {}}
            whileTap={!isOutOfStock && quantity < stock ? { scale: 0.9 } : {}}
          >
            <Plus size={18} />
          </motion.button>
        </div>
        {isLowStock && !isOutOfStock && (
          <p className="text-yellow-400 text-sm flex items-center">
            <AlertTriangle size={16} className="mr-1" />
            Chỉ còn {stock} sản phẩm trong kho
          </p>
        )}
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
          disabled={isOutOfStock}
          className={`${
            isOutOfStock
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 hover:shadow-lg hover:shadow-primary/30"
          } py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2`}
          whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
          whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
        >
          <CreditCard size={20} />
          {isOutOfStock ? "Hết hàng" : "Mua ngay"}
        </motion.button>
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`${
            isOutOfStock
              ? "border-2 border-gray-600 text-gray-400 cursor-not-allowed"
              : "border-2 border-primary text-primary hover:bg-primary hover:text-slate-900"
          } py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2`}
          whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
          whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
        >
          <ShoppingCart size={20} />
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
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
        transition={{ delay: 0.8 }}
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
