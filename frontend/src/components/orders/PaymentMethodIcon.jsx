import { CreditCard, Truck, Wallet, Landmark } from "lucide-react"

const PaymentMethodIcon = ({ method }) => {
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "COD":
        return <Truck size={16} className="text-gray-300" />
      case "VNPay":
        return <CreditCard size={16} className="text-blue-400" />
      case "MoMo":
        return <Wallet size={16} className="text-pink-400" />
      case "BankTransfer":
        return <Landmark size={16} className="text-green-400" />
      default:
        return <CreditCard size={16} className="text-gray-400" />
    }
  }

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "COD":
        return "COD"
      case "VNPay":
        return "VNPay"
      case "MoMo":
        return "MoMo"
      case "BankTransfer":
        return "Bank"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="flex items-center">
      {getPaymentMethodIcon(method)}
      <span className="ml-2 text-xs text-gray-400">{getPaymentMethodLabel(method)}</span>
    </div>
  )
}

export default PaymentMethodIcon
