"use client"
import { motion } from "framer-motion"

const ConfirmButton = ({ icon, text, loading, onClick, disabled = false, className = "" }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-3 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-70 font-medium hover:scale-105 ${className}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mr-3"></div>
          Đang xử lý...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {text}
        </>
      )}
    </motion.button>
  )
}

export default ConfirmButton
