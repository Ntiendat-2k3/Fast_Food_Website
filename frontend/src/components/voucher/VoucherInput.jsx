"use client"
import { Tag } from "lucide-react"

const VoucherInput = ({ voucherCode, setVoucherCode, onApplyVoucher, isApplying }) => {
  return (
    <div className="flex">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Tag size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Nhập mã giảm giá..."
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
          className="pl-10 block w-full bg-slate-600/50 text-white border border-slate-500 rounded-l-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          onKeyPress={(e) => e.key === "Enter" && onApplyVoucher()}
        />
      </div>
      <button
        onClick={onApplyVoucher}
        disabled={isApplying}
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-3 px-6 rounded-r-xl transition-all duration-300 disabled:opacity-70 flex items-center font-medium"
      >
        {isApplying ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div> : null}
        Áp dụng
      </button>
    </div>
  )
}

export default VoucherInput
