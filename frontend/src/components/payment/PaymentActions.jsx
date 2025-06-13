"use client"

import { CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const PaymentActions = ({ onCancel, onComplete, isProcessing }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4"
    >
      <button
        onClick={onCancel}
        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-300 font-medium rounded-lg transition-colors"
      >
        Hủy thanh toán
      </button>
      <button
        onClick={onComplete}
        disabled={isProcessing}
        className="px-6 py-3 bg-primary hover:bg-primary-dark text-dark font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark mr-3"></div>
            Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle size={20} className="mr-2" />
            Đã thanh toán
          </>
        )}
      </button>
    </motion.div>
  )
}

export default PaymentActions
