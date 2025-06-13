"use client"
import { Check, X } from "lucide-react"

const AppliedVoucher = ({ voucherCode, appliedVoucher, onRemoveVoucher }) => {
  return (
    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Check size={20} className="text-green-400 mr-2" />
          <div>
            <p className="text-green-300 font-medium">{voucherCode}</p>
            <p className="text-green-400 text-sm">
              {appliedVoucher.voucherInfo.discountType === "percentage"
                ? `Giảm ${appliedVoucher.voucherInfo.discountValue}%`
                : `Giảm ${appliedVoucher.voucherInfo.discountValue.toLocaleString("vi-VN")}đ`}
              {appliedVoucher.voucherInfo.maxDiscountAmount
                ? ` (tối đa ${appliedVoucher.voucherInfo.maxDiscountAmount.toLocaleString("vi-VN")}đ)`
                : ""}
            </p>
          </div>
        </div>
        <button onClick={onRemoveVoucher} className="text-red-400 hover:text-red-300 transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

export default AppliedVoucher
