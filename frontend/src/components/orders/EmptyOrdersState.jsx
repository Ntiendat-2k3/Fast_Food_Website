"use client"
import { motion } from "framer-motion"
import { Package } from "lucide-react"

const EmptyOrdersState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <Package size={48} className="text-gray-400" />
      </div>
      <h2 className="text-xl text-gray-300 mb-2">Bạn chưa có đơn hàng nào</h2>
      <p className="text-gray-400 mb-6">Hãy đặt món ăn đầu tiên của bạn ngay bây giờ</p>
      <button
        onClick={() => (window.location.href = "/foods")}
        className="bg-gradient-to-r from-primary to-primary-dark text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
      >
        Xem thực đơn
      </button>
    </motion.div>
  )
}

export default EmptyOrdersState
