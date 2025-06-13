"use client"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"

const EmptyCartState = ({ onAction, actionText, title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <ShoppingBag size={48} className="text-gray-400" />
      </div>
      <h2 className="text-xl text-gray-300 mb-4">{title}</h2>
      <button
        onClick={onAction}
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
      >
        {actionText}
      </button>
    </motion.div>
  )
}

export default EmptyCartState
