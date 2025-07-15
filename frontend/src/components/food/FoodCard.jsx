"use client"

import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingCart, Heart, Eye, Plus, Check } from "lucide-react"
import { StoreContext } from "../../context/StoreContext"
import { slugify } from "../../utils/slugify"
import ImageWithFallback from "../ui/ImageWithFallback"
import Rating from "../ui/Rating"
import PriceDisplay from "../ui/PriceDisplay"
import Button from "../common/Button"

const FoodCard = ({
  _id,
  name,
  price,
  description,
  image,
  index = 0,
  rating = 0,
  totalReviews = 0,
  viewMode = "grid",
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}) => {
  const { url, addToCart } = useContext(StoreContext)
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)

  const handleClick = () => {
    navigate(`/product/${slugify(name)}`)
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    setIsAdding(true)

    try {
      addToCart(name, 1)
      if (onAddToCart) {
        onAddToCart(name, 1)
      }
    } finally {
      setTimeout(() => setIsAdding(false), 1500)
    }
  }

  const handleToggleWishlist = (e) => {
    e.stopPropagation()
    if (onToggleWishlist) {
      onToggleWishlist(_id)
    }
  }

  const handleQuickView = (e) => {
    e.stopPropagation()
    navigate(`/product/${slugify(name)}`)
  }

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }} // Slightly faster delay
        whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }} // Added transition for hover
        className="group bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-700 hover:border-primary/50 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-48 sm:h-32 sm:w-48 flex-shrink-0">
            <ImageWithFallback
              src={`${url}/images/${image}`}
              alt={name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              containerClassName="h-full"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <motion.button
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 ${
                    isInWishlist ? "bg-red-500/80 text-white" : "bg-black/30 text-white hover:bg-red-500/50"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
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

            <div className="absolute bottom-3 left-3">
              <PriceDisplay
                price={price}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary-dark text-slate-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg"
              />
            </div>
          </div>

          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 line-clamp-1">
                  {name}
                </h3>
                {totalReviews > 0 && (
                  <div className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full ml-2">
                    <Rating value={rating} size="sm" showValue />
                  </div>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{description}</p>

              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                  <Rating value={rating} size="sm" />
                  <span>({totalReviews} đánh giá)</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              variant={isAdding ? "success" : "primary"}
              size="md"
              loading={isAdding}
              icon={isAdding ? <Check size={18} /> : <Plus size={18} />}
              className="w-full sm:w-auto self-start"
            >
              {isAdding ? "Đã thêm!" : "Thêm vào giỏ"}
            </Button>
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
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }} // Slightly faster delay
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }} // Added transition for hover
      className="group relative bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-700 hover:border-primary/50 cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500 rounded-xl" />

      <div className="relative h-48 sm:h-56 overflow-hidden">
        <ImageWithFallback
          src={`${url}/images/${image}`}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          containerClassName="h-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {totalReviews > 0 && (
          <motion.div
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full p-2 border border-white/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.3, type: "spring", stiffness: 200 }} // Adjusted delay and added spring
          >
            <Rating value={rating} size="sm" showValue />
          </motion.div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <motion.button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 ${
              isInWishlist ? "bg-red-500/80 text-white" : "bg-black/30 text-white hover:bg-red-500/50"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
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

        <motion.div
          className="absolute bottom-3 left-3"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.4, ease: "easeOut" }} // Adjusted delay
        >
          <PriceDisplay
            price={price}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary-dark text-slate-900 px-3 py-1 rounded-full font-bold text-sm shadow-lg"
          />
        </motion.div>
      </div>

      <div className="p-4 sm:p-6 flex-1 flex-col relative z-10 flex">
        {" "}
        {/* Added flex and flex-col */}
        <motion.h3
          className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.1, ease: "easeOut" }} // Adjusted delay
        >
          {name}
        </motion.h3>
        <motion.p
          className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.2, ease: "easeOut" }} // Adjusted delay
        >
          {description}
        </motion.p>
        {totalReviews > 0 && (
          <motion.div
            className="flex items-center gap-2 mb-4 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.3, ease: "easeOut" }} // Adjusted delay
          >
            <Rating value={rating} size="sm" />
            <span>({totalReviews} đánh giá)</span>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.4, ease: "easeOut" }} // Adjusted delay
        >
          <Button
            onClick={handleAddToCart}
            variant={isAdding ? "success" : "primary"}
            size="md"
            loading={isAdding}
            icon={isAdding ? <Check size={18} /> : <ShoppingCart size={18} />}
            className="w-full"
          >
            {isAdding ? "Đã thêm!" : "Thêm vào giỏ"}
          </Button>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/20 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}

export default FoodCard
