import { Package } from "lucide-react"
import OrderStatusBadge from "./OrderStatusBadge"
import PaymentStatusBadge from "./PaymentStatusBadge"

const OrderHeader = ({ order, formatDate }) => {
  return (
    <div className="bg-slate-800/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-600 hover:cursor-pointer">
      <div className="flex items-center mb-2 sm:mb-0">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mr-3">
          <Package size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">#{order._id.slice(-6)}</p>
          <p className="text-gray-400 text-xs">{formatDate(order.date)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
    </div>
  )
}

export default OrderHeader
