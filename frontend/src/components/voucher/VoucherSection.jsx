"use client"
import { motion } from "framer-motion"
import { Tag } from "lucide-react"
import VoucherInput from "./VoucherInput"
import AppliedVoucher from "./AppliedVoucher"

const VoucherSection = ({
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  isApplying,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600"
    >
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <Tag className="mr-2 text-yellow-400" size={20} />
        Mã giảm giá
      </h3>

      {appliedVoucher ? (
        <AppliedVoucher voucherCode={voucherCode} appliedVoucher={appliedVoucher} onRemoveVoucher={onRemoveVoucher} />
      ) : (
        <VoucherInput
          voucherCode={voucherCode}
          setVoucherCode={setVoucherCode}
          onApplyVoucher={onApplyVoucher}
          isApplying={isApplying}
        />
      )}
    </motion.div>
  )
}

export default VoucherSection
