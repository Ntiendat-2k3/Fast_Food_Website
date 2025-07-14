import { Package } from "lucide-react"

const OrderItemsList = ({ items }) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3 p-2 bg-gray-800/20 rounded-lg border border-gray-700/30">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-gray-300" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-medium text-white">{item.name}</h5>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Số lượng: {item.quantity}</span>
              <span>Giá: {(item.price * item.quantity).toLocaleString()} đ</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderItemsList
