"use client"
import { motion } from "framer-motion"
import { Sparkles, RefreshCw } from 'lucide-react'

const CartHeader = ({ onRefresh, isRefreshing }) => {
  return (
    <div className="p-4 sm:p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center">
          <Sparkles className="text-yellow-400 mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Giỏ hàng của bạn</h1>
            <p className="text-gray-300 text-xs sm:text-sm hidden sm:block">Quản lý sản phẩm yêu thích</p>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center text-gray-300 hover:text-yellow-400 transition-colors disabled:opacity-50 p-2 sm:p-3 rounded-lg hover:bg-slate-700/50"
        >
          <RefreshCw size={16} className={`sm:w-5 sm:h-5 mr-1 sm:mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="text-xs sm:text-sm">Cập nhật</span>
        </motion.button>
      </div>
    </div>
  )
}

export default CartHeader
