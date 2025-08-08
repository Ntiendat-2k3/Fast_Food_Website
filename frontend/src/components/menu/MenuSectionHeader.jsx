"use client"
import { motion } from "framer-motion"

const MenuSectionHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-6 md:mb-12"
    >
      <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
        Thực đơn của chúng tôi
      </h2>
      <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto">
        Khám phá những món ăn ngon được chế biến từ nguyên liệu tươi ngon nhất
      </p>
    </motion.div>
  )
}

export default MenuSectionHeader
