"use client"

import { motion } from "framer-motion"

const LoadingSpinner = ({ size = "md", color = "primary", text = "", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const colors = {
    primary: "border-primary",
    white: "border-white",
    gray: "border-gray-400",
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      {text && <p className="mt-3 text-gray-300 text-sm">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
