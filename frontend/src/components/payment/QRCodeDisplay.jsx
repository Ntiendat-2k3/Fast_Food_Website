"use client"

import { motion } from "framer-motion"

const QRCodeDisplay = ({ imageUrl, alt, size = "md" }) => {
  // Size variants
  const sizes = {
    sm: "w-48 h-48",
    md: "w-64 h-64",
    lg: "w-80 h-80",
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-slate-700/30 backdrop-blur-md p-6 rounded-xl shadow-lg inline-block mb-6 border border-slate-600/50"
    >
      <div className="bg-white p-4 rounded-lg">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={alt || "QR Code"}
          className={`${sizes[size] || sizes.md} object-contain mx-auto`}
        />
      </div>
    </motion.div>
  )
}

export default QRCodeDisplay
