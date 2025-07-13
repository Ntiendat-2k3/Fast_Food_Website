"use client"

import { useState } from "react"
import { cn } from "../../lib/utils"

const ImageWithFallback = ({ src, alt, fallbackSrc = "/placeholder.svg", className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [error, setError] = useState(false)

  const handleError = () => {
    if (!error) {
      setImgSrc(fallbackSrc)
      setError(true)
    }
  }

  return (
    <img
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      onError={handleError}
      className={cn("object-cover", className)}
      {...props}
    />
  )
}

export default ImageWithFallback
