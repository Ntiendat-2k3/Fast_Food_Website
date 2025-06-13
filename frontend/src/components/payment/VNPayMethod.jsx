"use client"

import { motion } from "framer-motion"
import QRCodeDisplay from "./QRCodeDisplay"

const VNPayMethod = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
      <QRCodeDisplay
        imageUrl="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png"
        alt="VNPay QR Code"
        size="md"
      />
      <p className="text-gray-300 mb-6">Quét mã QR bằng ứng dụng ngân hàng hoặc ví VNPay để thanh toán</p>
    </motion.div>
  )
}

export default VNPayMethod
