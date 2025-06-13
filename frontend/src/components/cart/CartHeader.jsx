"use client"
import { motion } from "framer-motion"
import { Sparkles, RefreshCw } from "lucide-react"

const CartHeader = ({ onRefresh, isRefreshing }) => {
  return (
    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
          <Sparkles className="text-yellow-400 mr-3" size={24} />
          <h1 className="text-2xl font-bold text-white">Giỏ hàng của bạn</h1>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center text-gray-300 hover:text-yellow-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Cập nhật</span>
        </motion.button>
      </div>
    </div>
  )
}

export default CartHeader
