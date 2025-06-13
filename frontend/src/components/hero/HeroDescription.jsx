"use client"

import { motion } from "framer-motion"

const HeroDescription = () => {
  return (
    <motion.p
      className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      Khám phá hành trình ẩm thực đỉnh cao với những món ăn được chế biến từ
      <span className="text-yellow-300 font-semibold"> nguyên liệu tươi sống </span>
      bởi các đầu bếp
      <span className="text-yellow-300 font-semibold"> chuyên nghiệp hàng đầu</span>
    </motion.p>
  )
}

export default HeroDescription
