"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const ImageWithFallback = ({
  src,
  alt,
  fallback = "/placeholder.svg",
  className = "",
  containerClassName = "",
  showLoader = true,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleLoad = () => {
    setImageLoaded(true)
  }

  const handleError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {showLoader && !imageLoaded && (
        <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <motion.img
        src={imageError ? fallback : src}
        alt={alt}
        className={`transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ scale: 1.1 }}
        animate={{ scale: imageLoaded ? 1 : 1.1 }}
        transition={{ duration: 0.5 }}
        {...props}
      />
    </div>
  )
}

export default ImageWithFallback
