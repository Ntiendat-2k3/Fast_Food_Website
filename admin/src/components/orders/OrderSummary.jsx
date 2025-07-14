import { Receipt, Tag, Truck, DollarSign } from "lucide-react"

const OrderSummary = ({ order, formatCurrency }) => {
  const subtotal = order.subtotal || order.itemsTotal || 0
  const discount = order.discountAmount || 0
  const shipping = order.shippingFee || order.deliveryFee || 14000
  const total = order.amount

  return (
    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
      <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
        <Receipt className="w-4 h-4" />
        Tóm tắt đơn hàng
      </h4>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Tạm tính:</span>
          <span className="text-white">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Giảm giá:
            </span>
            <span className="text-green-400">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-400 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Phí giao hàng:
          </span>
          <span className="text-white">{formatCurrency(shipping)}</span>
        </div>

        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Tổng cộng:
            </span>
            <span className="text-amber-400 font-bold">{formatCurrency(total)}</span>
          </div>
        </div>

        {order.voucherCode && (
          <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
            <span className="text-green-400 text-xs">Đã áp dụng voucher: {order.voucherCode}</span>
          </div>
        )}

        {order.distance && <div className="text-gray-400 text-xs">Khoảng cách giao hàng: {order.distance}</div>}
      </div>
    </div>
  )
}

export default OrderSummary
