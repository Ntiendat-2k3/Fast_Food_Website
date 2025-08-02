"use client"

import { useContext, useState, useEffect } from "react"
import { StoreContext } from "../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { Star, Check, Heart, Eye, Plus, AlertCircle, Package } from "lucide-react"
import { motion } from "framer-motion"
import { slugify } from "../utils/slugify"
import axios from "axios"

// Sales Count Component
const SalesCount = ({ productId, url }) => {
  const [salesCount, setSalesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSalesCount = async () => {
      try {
        const response = await axios.get(`${url}/api/food/sales/${productId}`)
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
      <div className="absolute bottom-3 right-3 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
        <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
        {/* Loading indicator */}
      </div>
    )
  }

  return (
    <div className="absolute bottom-3 right-3 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
      <Check size={12} className="mr-1" />
      Đã bán {salesCount > 0 ? `${salesCount}+` : "0"}
    </div>
  )
}

function FoodItem({ name, price, description, image, index, _id, rating = 0, totalReviews = 0, viewMode = "grid" }) {
  const { url, addToCart, token } = useContext(StoreContext)
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)

  const [inventory, setInventory] = useState(null)
  const [inventoryLoading, setInventoryLoading] = useState(true)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get(`${url}/api/inventory/product/${_id}`)
        if (response.data.success) {
          setInventory(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching inventory:", error)
      } finally {
        setInventoryLoading(false)
      }
    }

    if (_id) {
      fetchInventory()
    }
  }, [_id, url])

  // Check if item is in wishlist when component mounts
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!token || !_id) return

      try {
        const response = await axios.get(`${url}/api/wishlist/check/${_id}`, {
          headers: { token },
        })

        if (response.data.success) {
          setIsLiked(response.data.isInWishlist)
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error)
      }
    }

    checkWishlistStatus()
  }, [_id, token, url])

  const getStockStatus = () => {
    if (inventoryLoading) return { text: "Đang tải...", color: "text-gray-400" }
    if (!inventory) return { text: "Không có thông tin", color: "text-gray-400" }

    if (inventory.quantity === 0) {
      return { text: "Hết hàng", color: "text-red-400" }
    } else if (inventory.quantity <= 20) {
      return { text: `Còn ${inventory.quantity} sản phẩm`, color: "text-yellow-400" }
    } else {
      return { text: `Còn ${inventory.quantity} sản phẩm`, color: "text-green-400" }
    }
  }

  const stockStatus = getStockStatus()
  const isOutOfStock = inventory && inventory.quantity <= 0

  const handleClick = () => {
    navigate(`/product/${slugify(name)}`)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()

    if (inventory && inventory.quantity <= 0) {
      return // Không cho phép thêm vào giỏ hàng nếu hết hàng
    }

    setIsAdding(true)
    addToCart(name, 1)

    setTimeout(() => {
      setIsAdding(false)
    }, 1500)
  }

  const handleLike = async (e) => {
    e.stopPropagation()

    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích")
      return
    }

    if (isWishlistLoading) return

    setIsWishlistLoading(true)

    try {
      if (isLiked) {
        // Remove from wishlist
        const response = await axios.post(`${url}/api/wishlist/remove`, { foodId: _id }, { headers: { token } })

        if (response.data.success) {
          setIsLiked(false)
        } else {
          console.error("Error removing from wishlist:", response.data.message)
        }
      } else {
        // Add to wishlist
        const response = await axios.post(`${url}/api/wishlist/add`, { foodId: _id }, { headers: { token } })

        if (response.data.success) {
          setIsLiked(true)
        } else {
          console.error("Error adding to wishlist:", response.data.message)
          if (response.data.message !== "Sản phẩm đã có trong danh sách yêu thích") {
            alert(response.data.message)
          }
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      alert("Có lỗi xảy ra khi cập nhật danh sách yêu thích")
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const handleQuickView = (e) => {
    e.stopPropagation()
    navigate(`/product/${slugify(name)}`)
  }

  // Encode filename for URL to handle special characters and spaces
  const getImageUrl = (imageName) => {
    if (!imageName) return "/placeholder.svg"

    try {
      // Encode the filename to handle spaces and special characters
      const encodedName = encodeURIComponent(imageName)
      return `${url}/images/${encodedName}`
    } catch (error) {
      console.error("Error encoding image name:", error)
      return "/placeholder.svg"
    }
  }

  const handleImageError = (e) => {
    console.error("Image failed to load:", image, "URL:", getImageUrl(image))
    setImageError(true)
    e.target.src = "/placeholder.svg"
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const imageUrl = imageError ? "/placeholder.svg" : getImageUrl(image)

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="group bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-700 hover:border-primary/50 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative h-48 sm:h-32 sm:w-48 flex-shrink-0 overflow-hidden">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1"></div>
              </div>
            )}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* Error indicator */}
            {imageError && (
              <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                No Image
              </div>
            )}

            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <motion.button
                  onClick={handleLike}
                  disabled={isWishlistLoading}
                  className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 ${
                    isLiked ? "bg-red-500/80 text-white" : "bg-black/30 text-white hover:bg-red-500/50"
                  } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  whileHover={{ scale: isWishlistLoading ? 1 : 1.1 }}
                  whileTap={{ scale: isWishlistLoading ? 1 : 0.9 }}
                >
                  {isWishlistLoading ? (
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  )}
                </motion.button>

                <motion.button
                  onClick={handleQuickView}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/20 hover:bg-primary/50 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-primary to-primary-dark text-slate-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg">
              {price?.toLocaleString("vi-VN") || 0} đ
            </div>

            {/* Sales Count Badge */}
            <SalesCount productId={_id} url={url} />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 line-clamp-1">
                  {name}
                </h3>
                {totalReviews > 0 && (
                  <div className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full ml-2">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    <span className="text-xs font-bold ml-1 text-white">{rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{description}</p>

              {/* Reviews */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.floor(rating) ? "text-primary fill-primary" : "text-gray-500"}`}
                      />
                    ))}
                  </div>
                  <span>({totalReviews} đánh giá)</span>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full sm:w-auto self-start py-2 px-4 sm:py-3 sm:px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px] ${
                isOutOfStock
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : isAdding
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 hover:shadow-lg hover:shadow-primary/30"
              }`}
              whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
              whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
            >
              {isOutOfStock ? (
                <>
                  <AlertCircle size={18} />
                  Hết hàng
                </>
              ) : isAdding ? (
                <>
                  <Check size={18} />
                  Đã thêm!
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Thêm vào giỏ
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-700 hover:border-primary/50 cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500 rounded-xl" />

      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1"></div>
          </div>
        )}
        <motion.img
          src={imageUrl}
          alt={name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          whileHover={{ scale: 1.1 }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Error indicator */}
        {imageError && (
          <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            No Image
          </div>
        )}

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        {totalReviews > 0 && (
          <motion.div
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full p-2 border border-white/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <div className="flex items-center">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-xs font-bold ml-1 text-white">{rating.toFixed(1)}</span>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <motion.button
            onClick={handleLike}
            disabled={isWishlistLoading}
            className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 ${
              isLiked ? "bg-red-500/80 text-white" : "bg-black/30 text-white hover:bg-red-500/50"
            } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            whileHover={{ scale: isWishlistLoading ? 1 : 1.1 }}
            whileTap={{ scale: isWishlistLoading ? 1 : 0.9 }}
          >
            {isWishlistLoading ? (
              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            )}
          </motion.button>

          <motion.button
            onClick={handleQuickView}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/20 hover:bg-primary/50 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Eye className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Price Tag */}
        <motion.div
          className="absolute bottom-3 left-3 bg-gradient-to-r from-primary to-primary-dark text-slate-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
        >
          {price?.toLocaleString("vi-VN") || 0} đ
        </motion.div>

        {/* Stock Status Badge */}
        <div
          className={`absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-bold flex items-center ${
            isOutOfStock
              ? "bg-red-500/80 text-white"
              : inventory?.quantity <= 20
                ? "bg-yellow-500/80 text-white"
                : "bg-green-500/80 text-white"
          }`}
        >
          <Package size={12} className="mr-1" />
          {stockStatus.text}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col relative z-10">
        <motion.h3
          className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          {name}
        </motion.h3>

        <motion.p
          className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          {description}
        </motion.p>

        {/* Reviews */}
        {totalReviews > 0 && (
          <motion.div
            className="flex items-center gap-2 mb-4 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(rating) ? "text-primary fill-primary" : "text-gray-500"}`}
                />
              ))}
            </div>
            <span>({totalReviews} đánh giá)</span>
          </motion.div>
        )}

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px] ${
            isOutOfStock
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : isAdding
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 hover:shadow-lg hover:shadow-primary/30"
          }`}
          whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
          whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.5 }}
        >
          {isOutOfStock ? (
            <>
              <AlertCircle size={18} />
              Hết hàng
            </>
          ) : isAdding ? (
            <>
              <Check size={18} />
              Đã thêm!
            </>
          ) : (
            <>
              <Plus size={18} />
              Thêm vào giỏ
            </>
          )}
        </motion.button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/20 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}

export default FoodItem
