"use client"
import { motion } from "framer-motion"
import { Users, Star, Clock, Award } from 'lucide-react'

const HeroStats = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Khách hàng" },
    { icon: Star, value: "4.9", label: "Đánh giá" },
    { icon: Clock, value: "30p", label: "Giao hàng" },
    { icon: Award, value: "100+", label: "Món ăn" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="grid grid-cols-4 gap-2 md:gap-8 max-w-2xl mx-auto mt-6 md:mt-12"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
          className="text-center"
        >
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-6 border border-slate-700 hover:border-primary/50 transition-all duration-300 group hover:bg-slate-800/50">
            <stat.icon className="h-4 w-4 md:h-8 md:w-8 text-primary mx-auto mb-1 md:mb-3 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-lg md:text-2xl font-bold text-white mb-0 md:mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default HeroStats
