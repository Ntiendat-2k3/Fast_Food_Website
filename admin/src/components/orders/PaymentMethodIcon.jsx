import { CreditCard, Banknote, QrCode } from "lucide-react"

const PaymentMethodIcon = ({ method }) => {
  let IconComponent
  let tooltipText

  switch (method) {
    case "COD":
      IconComponent = Banknote
      tooltipText = "Thanh toán khi nhận hàng (COD)"
      break
    case "VNPAY":
      IconComponent = QrCode
      tooltipText = "Thanh toán qua VNPAY"
      break
    case "MOMO":
      IconComponent = QrCode
      tooltipText = "Thanh toán qua MoMo"
      break
    default:
      IconComponent = CreditCard
      tooltipText = "Phương thức thanh toán khác"
  }

  return (
    <div className="flex items-center" title={tooltipText}>
      <IconComponent size={18} className="text-gray-500 dark:text-gray-400" />
    </div>
  )
}

export default PaymentMethodIcon
