import { Package, Clock, CheckCircle, Truck } from "lucide-react"

const OrderStatusBadge = ({ status }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return <Clock size={18} className="text-primary" />
      case "Đang giao hàng":
        return <Truck size={18} className="text-blue-400" />
      case "Đã giao":
      case "Đã giao hàng":
        return <CheckCircle size={18} className="text-green-400" />
      default:
        return <Package size={18} className="text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return "bg-primary/20 text-primary border border-primary/30"
      case "Đang giao hàng":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      case "Đã giao":
      case "Đã giao hàng":
        return "bg-green-500/20 text-green-400 border border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    }
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="ml-1">{status || "Đang xử lý"}</span>
    </span>
  )
}

export default OrderStatusBadge
