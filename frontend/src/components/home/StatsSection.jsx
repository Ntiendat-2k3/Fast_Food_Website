"use client"
import { motion } from "framer-motion"
import { Heart, ShoppingBag, Award, Zap } from "lucide-react"

const StatsSection = () => {
  const stats = [
    { number: "10K+", label: "Khách hàng hài lòng", icon: <Heart className="h-6 w-6" /> },
    { number: "500+", label: "Món ăn đa dạng", icon: <ShoppingBag className="h-6 w-6" /> },
    { number: "50+", label: "Đối tác nhà hàng", icon: <Award className="h-6 w-6" /> },
    { number: "24/7", label: "Phục vụ không ngừng", icon: <Zap className="h-6 w-6" /> },
  ]

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-700 hover:border-yellow-400/50 transition-all duration-300"
            >
              <div className="text-yellow-400 mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
