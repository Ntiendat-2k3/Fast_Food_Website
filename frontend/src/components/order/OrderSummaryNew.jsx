"use client"
import { Package, Truck, Tag, Calculator } from "lucide-react"
import { motion } from "framer-motion"

const OrderSummaryNew = ({ items, subtotal, shippingFee, discount, total, appliedVoucher, shippingInfo }) => {
  return (
    <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Package className="mr-2 text-yellow-400" size={20} />
        Chi tiết đơn hàng
      </h3>

      {/* Order Items */}
      <div className="space-y-3 mb-6">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <motion.div
              key={item._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between py-2 border-b border-slate-600/50 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={`http://localhost:4000/images/${item.image}`}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg border border-slate-600"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=48&width=48&text=Food"
                  }}
                />
                <div>
                  <p className="text-white font-medium text-sm">{item.name}</p>
                  <p className="text-gray-400 text-xs">
                    {item.price?.toLocaleString("vi-VN")}đ x {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-yellow-400 font-semibold">
                {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}đ
              </p>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <Package className="mx-auto text-gray-500 mb-2" size={48} />
            <p className="text-gray-400">Chưa có sản phẩm nào được chọn</p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="space-y-3 border-t border-slate-600 pt-4">
        <div className="flex justify-between text-gray-300">
          <span>Tạm tính</span>
          <span>{(subtotal || 0).toLocaleString("vi-VN")}đ</span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span className="flex items-center">
            <Truck className="mr-1" size={16} />
            Phí vận chuyển
          </span>
          <span>{(shippingFee || 0).toLocaleString("vi-VN")}đ</span>
        </div>

        {shippingInfo && (
          <div className="text-xs text-gray-400 ml-5">
            Khoảng cách: {shippingInfo.distance} • Thời gian: {shippingInfo.duration}
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-green-400">
            <span className="flex items-center">
              <Tag className="mr-1" size={16} />
              Giảm giá
              {appliedVoucher?.voucherInfo?.code && (
                <span className="ml-1 text-xs bg-green-500/20 px-2 py-1 rounded">
                  {appliedVoucher.voucherInfo.code}
                </span>
              )}
            </span>
            <span>-{discount.toLocaleString("vi-VN")}đ</span>
          </div>
        )}

        <div className="flex justify-between text-white font-semibold text-lg border-t border-slate-600 pt-3">
          <span className="flex items-center">
            <Calculator className="mr-1" size={18} />
            Tổng cộng
          </span>
          <span className="text-yellow-400">{(total || 0).toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummaryNew
