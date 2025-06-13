"use client"
import OrderItemsList from "./OrderItemsList"
import { Tag } from "lucide-react"

const OrderSummary = ({ calculateOrderAmount, currentAppliedVoucher, getFinalAmount, children, ...props }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">Đơn hàng của bạn</h2>
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
        <OrderItemsList {...props} />

        <div className="mt-6 pt-6 border-t border-slate-600 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Tạm tính</span>
            <span className="text-white">{calculateOrderAmount().toLocaleString("vi-VN")}đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Phí vận chuyển</span>
            <span className="text-white">14.000đ</span>
          </div>

          {currentAppliedVoucher && (
            <div className="flex justify-between text-green-400">
              <div className="flex items-center">
                <Tag size={16} className="mr-2" />
                <span>Giảm giá ({currentAppliedVoucher.voucherInfo.code})</span>
              </div>
              <span>- {currentAppliedVoucher.discountAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}

          {/* Voucher Section */}
          {children}

          <div className="pt-3 flex justify-between">
            <span className="text-lg font-medium text-white">Tổng cộng</span>
            <span className="text-lg font-bold text-yellow-400">{getFinalAmount().toLocaleString("vi-VN")}đ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
