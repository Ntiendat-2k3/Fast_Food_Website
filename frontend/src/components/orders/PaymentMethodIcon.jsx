import { CreditCard, Truck, Wallet, Landmark } from "lucide-react"

const PaymentMethodIcon = ({ method }) => {
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "COD":
        return <Truck size={16} className="text-yellow-400" />
      case "VNPay":
        return <CreditCard size={16} className="text-blue-400" />
      case "MoMo":
        return <Wallet size={16} className="text-pink-400" />
      case "BankTransfer":
        return <Landmark size={16} className="text-green-400" />
      default:
        return <CreditCard size={16} className="text-slate-400" />
    }
  }

  return <div className="flex items-center">{getPaymentMethodIcon(method)}</div>
}

export default PaymentMethodIcon
