import { Package, Clock, CheckCircle, Truck } from "lucide-react"

const OrderStatusBadge = ({ status }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return <Clock size={16} className="text-yellow-400" />
      case "Đang giao hàng":
        return <Truck size={16} className="text-blue-400" />
      case "Đã giao":
      case "Đã giao hàng":
        return <CheckCircle size={16} className="text-green-400" />
      default:
        return <Package size={16} className="text-slate-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
      case "Đang giao hàng":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/40"
      case "Đã giao":
      case "Đã giao hàng":
        return "bg-green-500/20 text-green-400 border border-green-500/40"
      default:
        return "bg-slate-500/20 text-slate-400 border border-slate-500/40"
    }
  }

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span>{status || "Đang xử lý"}</span>
    </span>
  )
}

export default OrderStatusBadge
