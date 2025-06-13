"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { useNavigate } from "react-router-dom"

const WishlistEmpty = () => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
    >
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 max-w-md mx-auto shadow-2xl border border-slate-700">
        <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Heart size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Danh sách yêu thích trống</h2>
        <p className="text-gray-300 mb-6">Hãy thêm những món ăn yêu thích của bạn để dễ dàng tìm lại sau này</p>
        <button
          onClick={() => navigate("/foods")}
          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
        >
          Khám phá thực đơn
        </button>
      </div>
    </motion.div>
  )
}

export default WishlistEmpty
