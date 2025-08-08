"use client"
import { motion } from "framer-motion"
import { CreditCard, Package, Truck, Tag } from 'lucide-react'

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
      className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-4 sm:p-6 border-b border-slate-600">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-yellow-400" />
          Tổng đơn hàng
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Selected Items */}
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2 text-gray-300">
              <Package size={16} />
              <span className="text-sm sm:text-base">Sản phẩm đã chọn ({selectedItemsCount})</span>
            </div>
            <span className="font-medium text-white text-sm sm:text-base">
              {selectedCartAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Shipping Fee */}
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2 text-gray-300">
              <Truck size={16} />
              <span className="text-sm sm:text-base">Phí vận chuyển</span>
            </div>
            <span className="font-medium text-white text-sm sm:text-base">
              {shippingFee.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Voucher Discount */}
          {appliedVoucher && selectedCartAmount > 0 && (
            <div className="flex justify-between items-center py-2 text-green-400">
              <div className="flex items-center gap-2">
                <Tag size={16} />
                <span className="text-sm sm:text-base">Giảm giá</span>
              </div>
              <span className="font-medium text-sm sm:text-base">
                - {appliedVoucher.discountAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-600 my-4"></div>

          {/* Total */}
          <div className="flex justify-between items-center py-2">
            <span className="text-lg sm:text-xl font-bold text-white">Tổng cộng</span>
            <span className="text-lg sm:text-xl font-bold text-yellow-400">
              {finalAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={!hasSelectedItems}
            className={`w-full py-3 sm:py-4 rounded-xl flex items-center justify-center transition-all duration-300 font-semibold text-sm sm:text-base ${
              hasSelectedItems
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 hover:scale-[1.02] shadow-lg hover:shadow-yellow-500/30"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            <CreditCard size={18} className="mr-2" />
            {hasSelectedItems
              ? `Tiến hành thanh toán (${selectedItemsCount} sản phẩm)`
              : "Chọn sản phẩm để thanh toán"
            }
          </button>

          {/* Security Notice */}
          <div className="text-center text-xs sm:text-sm text-gray-400 mt-3">
            🔒 Thanh toán an toàn và bảo mật
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartSummary
