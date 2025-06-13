const PaymentStatusBadge = ({ status }) => {
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-500/20 text-green-400 border border-green-500/30"
      case "Đang xử lý":
        return "bg-primary/20 text-primary border border-primary/30"
      case "Thanh toán thất bại":
        return "bg-red-500/20 text-red-400 border border-red-500/30"
      case "Chưa thanh toán":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    }
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(status)}`}>
      {status || "Chưa thanh toán"}
    </span>
  )
}

export default PaymentStatusBadge
