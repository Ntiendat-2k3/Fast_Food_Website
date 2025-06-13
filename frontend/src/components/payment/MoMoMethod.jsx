"use client"

import { motion } from "framer-motion"
import QRCodeDisplay from "./QRCodeDisplay"
import CopyableField from "./CopyableField"

const MoMoMethod = ({ walletInfo }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
      <QRCodeDisplay
        imageUrl="https://developers.momo.vn/v3/vi/assets/images/logo-momo-300-8126a80b5591add9f25a8b9f26c7ecf4.jpg"
        alt="MoMo QR Code"
        size="md"
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-700/30 backdrop-blur-md p-5 rounded-xl mb-6 max-w-md mx-auto border border-slate-600/50"
      >
        <CopyableField label="Số điện thoại" value={walletInfo.phone} />
        <CopyableField label="Người nhận" value={walletInfo.name} copyable={false} />
        <CopyableField label="Nội dung chuyển khoản" value={walletInfo.content} />
      </motion.div>

      <p className="text-gray-300 mb-6">Quét mã QR bằng ứng dụng MoMo hoặc chuyển khoản theo thông tin trên</p>
    </motion.div>
  )
}

export default MoMoMethod
