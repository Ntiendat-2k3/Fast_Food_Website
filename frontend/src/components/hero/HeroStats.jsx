"use client"

import { motion } from "framer-motion"

const HeroStats = () => {
  const stats = [
    { number: "100+", label: "Món ăn đặc biệt" },
    { number: "50K+", label: "Khách hàng hài lòng" },
    { number: "5★", label: "Đánh giá trung bình" },
  ]

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-6 mt-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 min-w-[140px]"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-3xl font-bold text-yellow-400 mb-1">{stat.number}</div>
          <div className="text-gray-300 text-sm">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default HeroStats
