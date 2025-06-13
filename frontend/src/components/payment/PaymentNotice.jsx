"use client"

import { Clock } from "lucide-react"
import { motion } from "framer-motion"
import CountdownTimer from "./CountdownTimer"

const PaymentNotice = ({ initialSeconds = 300, onComplete }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-slate-700/30 border-l-4 border-primary p-4 mb-6 rounded-r-md flex items-center"
    >
      <Clock size={20} className="text-primary mr-3 flex-shrink-0" />
      <p className="text-gray-300">
        Vui lòng hoàn tất thanh toán trong <CountdownTimer initialSeconds={initialSeconds} onComplete={onComplete} />.
        Đơn hàng của bạn sẽ được xác nhận sau khi thanh toán thành công.
      </p>
    </motion.div>
  )
}

export default PaymentNotice
