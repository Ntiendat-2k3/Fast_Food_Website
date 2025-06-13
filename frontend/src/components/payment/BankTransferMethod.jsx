"use client"

import { motion } from "framer-motion"
import { Landmark } from "lucide-react"
import PaymentInfoCard from "./PaymentInfoCard"

const BankTransferMethod = ({ bankInfo }) => {
  // Format bank info for PaymentInfoCard
  const bankFields = [
    { label: "Ngân hàng", value: bankInfo.bank, copyable: false },
    { label: "Chi nhánh", value: bankInfo.branch, copyable: false },
    { label: "Chủ tài khoản", value: bankInfo.name, copyable: false },
    { label: "Số tài khoản", value: bankInfo.number },
    { label: "Nội dung chuyển khoản", value: bankInfo.content },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
      <PaymentInfoCard title="Thông tin chuyển khoản" icon={Landmark} fields={bankFields} />

      <p className="text-gray-300 mb-6 text-center">
        Vui lòng chuyển khoản theo thông tin trên và nhấn "Đã thanh toán" sau khi hoàn tất
      </p>
    </motion.div>
  )
}

export default BankTransferMethod
