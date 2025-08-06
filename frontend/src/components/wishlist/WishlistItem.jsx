import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react'
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { slugify } from "../../utils/slugify"
import { toast } from "react-toastify"

const WishlistItem = ({ item, onRemove, index }) => {
  const { url, addToCart } = useContext(StoreContext)
  const navigate = useNavigate()
  const [isRemoving, setIsRemoving] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const food = item.foodId

  if (!food) {
    return null
  }

  const handleRemove = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isRemoving) return

    setIsRemoving(true)

    try {
      await onRemove(food._id)
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAddingToCart) return

    setIsAddingToCart(true)
    addToCart(food.name, 1)
    toast.success(`Đã thêm ${food.name} vào giỏ hàng`)

    setTimeout(() => {
      setIsAddingToCart(false)
    }, 1500)
  }

  const handleClick = () => {
    navigate(`/product/${slugify(food.name)}`)
  }

  const getImageUrl = (imageName) => {
    if (!imageName) return "/placeholder.svg?height=200&width=300&text=No+Image"
    try {
      const encodedName = encodeURIComponent(imageName)
      return `${url}/images/${encodedName}`
    } catch (error) {
      console.error("Error encoding image name:", error)
      return "/placeholder.svg?height=200&width=300&text=Error"
    }
  }

  const handleImageError = (e) => {
    setImageError(true)
    e.target.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const imageUrl = imageError ? "/placeholder.svg?height=200&width=300&text=Image+Error" : getImageUrl(food.image)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-700 hover:border-primary/50"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={handleClick}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={food.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Remove Button */}
        <motion.button
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 text-white border border-white/20 hover:bg-red-600/80 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          whileHover={{ scale: isRemoving ? 1 : 1.1 }}
          whileTap={{ scale: isRemoving ? 1 : 0.9 }}
          title="Xóa khỏi danh sách yêu thích"
        >
          {isRemoving ? (
            <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </motion.button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-primary to-primary-dark text-slate-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg">
          {food.price?.toLocaleString("vi-VN") || 0} đ
        </div>

        {/* Rating Badge */}
        {food.totalReviews > 0 && (
          <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-sm rounded-full p-2 border border-white/20">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="text-xs font-bold ml-1 text-white">{food.rating?.toFixed(1) || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="cursor-pointer" onClick={handleClick}>
          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {food.name}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed mt-1">
            {food.description}
          </p>
        </div>

        {/* Reviews */}
        {food.totalReviews > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.floor(food.rating || 0) ? "text-primary fill-primary" : "text-gray-500"}`}
                />
              ))}
            </div>
            <span>({food.totalReviews} đánh giá)</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isAddingToCart
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 hover:shadow-lg hover:shadow-primary/30"
            }`}
            whileHover={{ scale: isAddingToCart ? 1 : 1.02 }}
            whileTap={{ scale: isAddingToCart ? 1 : 0.98 }}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đã thêm!
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Thêm vào giỏ
              </>
            )}
          </motion.button>
        </div>

        {/* Added Date */}
        <div className="text-xs text-gray-400 border-t border-slate-600 pt-2">
          Đã thêm: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
        </div>
      </div>
    </motion.div>
  )
}

export default WishlistItem
