"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Share2, Star } from "lucide-react"

const ProductImageGallery = ({ images, productName, isInWishlist, toggleWishlist, ratingStats }) => {
  const [activeImage, setActiveImage] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div>
      <div className="relative h-64 sm:h-80 lg:h-96 mb-4 rounded-xl overflow-hidden bg-slate-700/50">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <motion.img
          key={activeImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          src={images[activeImage]}
          alt={productName}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Action Buttons Overlay */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <motion.button
            onClick={toggleWishlist}
            className={`p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 ${
              isInWishlist ? "bg-red-500/80 text-white" : "bg-black/30 text-white hover:bg-red-500/50"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={20} className={isInWishlist ? "fill-current" : ""} />
          </motion.button>
          <motion.button
            className="p-3 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/20 hover:bg-primary/50 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Share2 size={20} />
          </motion.button>
        </div>

        {/* Rating Badge */}
        {ratingStats.totalReviews > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20"
          >
            <div className="flex items-center">
              <Star className="h-4 w-4 text-primary fill-primary mr-1" />
              <span className="text-sm font-bold text-white">{ratingStats.averageRating.toFixed(1)}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((image, index) => (
          <motion.div
            key={index}
            onClick={() => setActiveImage(index)}
            className={`cursor-pointer rounded-lg overflow-hidden w-16 h-16 sm:w-20 sm:h-20 border-2 flex-shrink-0 transition-all duration-300 ${
              activeImage === index
                ? "border-primary shadow-lg shadow-primary/30"
                : "border-slate-600 hover:border-slate-500"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`${productName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ProductImageGallery
