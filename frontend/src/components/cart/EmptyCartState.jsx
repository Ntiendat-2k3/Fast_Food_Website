"use client"
import { motion } from "framer-motion"
import { ShoppingBag, ArrowRight } from 'lucide-react'

const EmptyCartState = ({ onAction, actionText, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12 sm:py-16"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center">
            <ShoppingBag size={40} className="sm:w-12 sm:h-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-300 mb-3 sm:mb-4">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base px-4">
          Hãy khám phá menu đa dạng của chúng tôi và thêm những món ăn yêu thích vào giỏ hàng!
        </p>

        {/* Action Button */}
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-500/30 flex items-center gap-2 mx-auto text-sm sm:text-base"
        >
          {actionText}
          <ArrowRight size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </motion.div>
  )
}

export default EmptyCartState
