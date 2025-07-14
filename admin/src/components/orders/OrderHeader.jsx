import { Package, Calendar, DollarSign, User } from "lucide-react"

const OrderHeader = ({ order }) => {
  return (
    <div className="flex items-start justify-between p-4 border-b border-gray-700/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
          <Package className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Order #{order._id.slice(-8).toUpperCase()}</h2>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(order.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>
                {order.address.firstName} {order.address.lastName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="text-amber-400 font-semibold">${order.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderHeader
