"use client"
import { Tag, Truck, Package } from "lucide-react"

const OrderSummaryNew = ({
  items = [],
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  total = 0,
  appliedVoucher = null,
  shippingInfo = null,
  children,
}) => {
  console.log("OrderSummaryNew props:", { items, subtotal, shippingFee, discount, total })

  return (
    <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Package className="mr-2 text-yellow-400" size={20} />
        Chi tiết đơn hàng
      </h3>

      {/* Order Items */}
      {items && items.length > 0 && (
        <div className="space-y-3 mb-6">
          {items.map((item, index) => (
            <div
              key={`${item._id || item.name}-${index}`}
              className="flex items-center justify-between py-2 border-b border-slate-600/50 last:border-b-0"
            >
              <div className="flex items-center">
                <img
                  src={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/images/${item.image}`}
                  alt={item.name || "Product"}
                  className="w-12 h-12 object-cover rounded-lg mr-3"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=48&width=48"
                  }}
                />
                <div>
                  <h4 className="text-white font-medium text-sm">{item.name || "Unknown Product"}</h4>
                  <p className="text-gray-400 text-xs">Số lượng: {item.quantity || 0}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">
                  {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}đ
                </p>
                <p className="text-gray-400 text-xs">
                  {(item.price || 0).toLocaleString("vi-VN")}đ x {item.quantity || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Summary */}
      <div className="space-y-3 pt-4 border-t border-slate-600">
        <div className="flex justify-between">
          <span className="text-gray-400">Tạm tính</span>
          <span className="text-white">{Number(subtotal || 0).toLocaleString("vi-VN")}đ</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Truck size={16} className="text-gray-400 mr-1" />
            <span className="text-gray-400">Phí vận chuyển</span>
          </div>
          <div className="text-right">
            <span className="text-white">{Number(shippingFee || 0).toLocaleString("vi-VN")}đ</span>
            {shippingInfo && (
              <div className="text-xs text-gray-400">
                {shippingInfo.distance || 0}km • {shippingInfo.duration || "Đang tính..."}
              </div>
            )}
          </div>
        </div>

        {appliedVoucher && Number(discount || 0) > 0 && (
          <div className="flex justify-between text-green-400">
            <div className="flex items-center">
              <Tag size={16} className="mr-1" />
              <span>Giảm giá ({appliedVoucher.voucherInfo?.code || appliedVoucher.code || "Voucher"})</span>
            </div>
            <span>- {Number(discount || 0).toLocaleString("vi-VN")}đ</span>
          </div>
        )}

        {/* Voucher Section - nếu có children */}
        {children}

        <div className="pt-3 border-t border-slate-600 flex justify-between">
          <span className="text-lg font-semibold text-white">Tổng cộng</span>
          <span className="text-lg font-bold text-yellow-400">{Number(total || 0).toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummaryNew
