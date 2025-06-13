"use client"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const HeroContent = () => {
  return (
    <div className="md:w-1/2 mb-12 md:mb-0">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-xl"
      >
        <div className="flex items-center mb-4">
          <Sparkles className="text-yellow-400 mr-2" size={24} />
          <span className="text-yellow-400 font-medium">Chào mừng đến với GreenEats</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
          Thưởng thức{" "}
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
            ẩm thực
          </span>{" "}
          tuyệt vời tại nhà
        </h1>
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          Đặt món ăn yêu thích của bạn chỉ với vài cú nhấp chuột. Chúng tôi giao hàng nhanh chóng và đảm bảo chất lượng.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/foods"
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium py-3 px-8 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-yellow-400/25 hover:scale-105"
          >
            Đặt hàng ngay <ArrowRight size={18} className="ml-2" />
          </Link>
          <Link
            to="/foods"
            className="bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 border border-slate-600 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300"
          >
            Xem thực đơn
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default HeroContent
