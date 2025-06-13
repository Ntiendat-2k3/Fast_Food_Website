"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

const WishlistHeader = ({ itemCount = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center mb-4">
        <Sparkles className="text-primary mr-3" size={32} />
        <h1 className="text-4xl font-bold text-white">Danh sách yêu thích</h1>
      </div>
      <p className="text-gray-300 text-lg">
        {itemCount > 0
          ? `Bạn có ${itemCount} sản phẩm trong danh sách yêu thích`
          : "Danh sách yêu thích của bạn đang trống"}
      </p>
    </motion.div>
  )
}

export default WishlistHeader
