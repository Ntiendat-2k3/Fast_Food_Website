"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Tag, Clock, AlertCircle } from "lucide-react"

const VoucherList = ({ vouchers = [], currentVoucher, orderAmount, onSelectVoucher, isLoading }) => {
  const [expanded, setExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 mb-3">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-2">Đang tải voucher...</p>
      </div>
    )
  }

  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-center text-gray-400">
          <AlertCircle size={16} className="mr-2" />
          <p className="text-sm">Không có voucher nào khả dụng</p>
        </div>
      </div>
    )
  }

  // Số lượng voucher hiển thị khi thu gọn
  const collapsedCount = 2
  const displayVouchers = expanded ? vouchers : vouchers.slice(0, collapsedCount)

  return (
    <motion.div
      className="bg-slate-700/50 rounded-lg p-4 mb-3 space-y-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {displayVouchers.map((voucher) => {
        const isApplied = currentVoucher && currentVoucher._id === voucher._id
        const isEligible = orderAmount >= voucher.minOrderValue

        return (
          <div
            key={voucher._id}
            className={`p-3 border rounded-lg flex justify-between items-center transition-all ${
              isApplied
                ? "bg-green-500/20 border-green-500/30"
                : isEligible
                  ? "bg-slate-600/50 border-slate-500 hover:border-yellow-400/50"
                  : "bg-slate-600/30 border-slate-600 opacity-60"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-400/20 p-2 rounded-lg">
                <Tag size={18} className="text-yellow-400" />
              </div>
              <div>
                <div className="font-medium text-white">{voucher.code}</div>
                <div className="text-sm text-gray-300">
                  {voucher.discountType === "percentage"
                    ? `Giảm ${voucher.discountValue}%`
                    : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                  {voucher.maxDiscountAmount &&
                    voucher.discountType === "percentage" &&
                    ` (tối đa ${voucher.maxDiscountAmount.toLocaleString("vi-VN")}đ)`}
                </div>
                {voucher.minOrderValue > 0 && (
                  <div className={`text-xs flex items-center mt-1 ${isEligible ? "text-green-400" : "text-red-400"}`}>
                    {isEligible ? <Check size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                    Đơn tối thiểu: {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                  </div>
                )}
                {voucher.expiryDate && (
                  <div className="text-xs text-gray-400 flex items-center mt-1">
                    <Clock size={12} className="mr-1" />
                    HSD: {new Date(voucher.expiryDate).toLocaleDateString("vi-VN")}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelectVoucher(voucher)}
              disabled={isApplied || !isEligible}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isApplied
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : isEligible
                    ? "bg-yellow-400 text-slate-900 hover:bg-yellow-500"
                    : "bg-slate-600 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isApplied ? "Đã áp dụng" : isEligible ? "Áp dụng" : "Không đủ điều kiện"}
            </button>
          </div>
        )
      })}

      {vouchers.length > collapsedCount && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-yellow-400 hover:text-yellow-300 py-1 text-sm font-medium transition-colors"
        >
          {expanded ? "Thu gọn" : `Xem thêm ${vouchers.length - collapsedCount} voucher`}
        </button>
      )}
    </motion.div>
  )
}

export default VoucherList
