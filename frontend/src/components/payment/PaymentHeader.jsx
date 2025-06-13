"use client"

import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

const PaymentHeader = ({ onBack, title }) => {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center mb-6">
      <button
        onClick={onBack}
        className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-gray-300 transition-colors mr-4"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-2xl font-bold text-white">{title || "Thanh toán đơn hàng"}</h1>
    </motion.div>
  )
}

export default PaymentHeader
