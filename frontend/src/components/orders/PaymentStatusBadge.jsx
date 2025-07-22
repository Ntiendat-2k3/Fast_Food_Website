import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

const PaymentStatusBadge = ({ status }) => {
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return <CheckCircle size={16} className="text-green-400" />
      case "Đang xử lý":
        return <Clock size={16} className="text-yellow-400" />
      case "Thanh toán thất bại":
        return <XCircle size={16} className="text-red-400" />
      case "Chưa thanh toán":
        return <AlertCircle size={16} className="text-slate-400" />
      default:
        return <AlertCircle size={16} className="text-slate-400" />
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-500/20 text-green-400 border border-green-500/40"
      case "Đang xử lý":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
      case "Thanh toán thất bại":
        return "bg-red-500/20 text-red-400 border border-red-500/40"
      case "Chưa thanh toán":
        return "bg-slate-500/20 text-slate-400 border border-slate-500/40"
      default:
        return "bg-slate-500/20 text-slate-400 border border-slate-500/40"
    }
  }

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(status)}`}
    >
      {getPaymentStatusIcon(status)}
      <span>{status || "Chưa thanh toán"}</span>
    </span>
  )
}

export default PaymentStatusBadge
