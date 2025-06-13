"use client"
import { motion } from "framer-motion"
import { CreditCard } from "lucide-react"

const CartSummary = ({
  selectedItemsCount,
  selectedCartAmount,
  appliedVoucher,
  finalAmount,
  hasSelectedItems,
  onCheckout,
}) => {
  const shippingFee = selectedCartAmount === 0 ? 0 : 14000

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600"
    >
      <h3 className="text-lg font-medium text-white mb-4">Tổng giỏ hàng</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-300">Sản phẩm đã chọn ({selectedItemsCount})</span>
          <span className="text-white">{selectedCartAmount.toLocaleString("vi-VN")} đ</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-300">Phí vận chuyển</span>
          <span className="text-white">{shippingFee.toLocaleString("vi-VN")} đ</span>
        </div>

        {appliedVoucher && selectedCartAmount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Giảm giá</span>
            <span>- {appliedVoucher.discountAmount.toLocaleString("vi-VN")} đ</span>
          </div>
        )}

        <div className="border-t border-slate-600 pt-3 flex justify-between">
          <span className="text-lg font-medium text-white">Tổng cộng</span>
          <span className="text-lg font-bold text-yellow-400">{finalAmount.toLocaleString("vi-VN")} đ</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={!hasSelectedItems}
        className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center transition-all duration-300 font-medium ${
          hasSelectedItems
            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 hover:scale-105"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        <CreditCard size={20} className="mr-2" />
        Tiến hành thanh toán ({selectedItemsCount} sản phẩm)
      </button>
    </motion.div>
  )
}

export default CartSummary
