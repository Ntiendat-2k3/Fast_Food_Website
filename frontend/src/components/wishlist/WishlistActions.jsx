"use client"

import { motion } from "framer-motion"
import { Heart, ShoppingCart } from 'lucide-react'
import { useNavigate } from "react-router-dom"

const WishlistActions = ({ onAddAllToCart, isAddingAll, itemCount }) => {
  const navigate = useNavigate()

  if (itemCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-8 text-center"
    >
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
          <Heart className="mr-2 text-primary" size={20} />
          Thao tác nhanh
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onAddAllToCart}
            disabled={isAddingAll}
            className={`bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center font-medium hover:scale-105 ${
              isAddingAll ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            {isAddingAll ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full mr-2"></div>
                Đang thêm...
              </>
            ) : (
              <>
                <ShoppingCart size={18} className="mr-2" />
                Thêm tất cả vào giỏ hàng
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/foods")}
            disabled={isAddingAll}
            className={`border border-primary text-primary hover:bg-primary hover:text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium ${
              isAddingAll ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default WishlistActions
