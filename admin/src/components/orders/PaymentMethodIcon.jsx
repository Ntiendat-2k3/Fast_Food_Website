import { CreditCard, Banknote, Smartphone, Building } from "lucide-react"

const PaymentMethodIcon = ({ method, size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const getPaymentConfig = (paymentMethod) => {
    switch (paymentMethod?.toLowerCase()) {
      case "momo":
        return {
          icon: Smartphone,
          color: "text-pink-400",
          bg: "bg-pink-500/20",
          label: "MoMo",
        }
      case "vnpay":
        return {
          icon: CreditCard,
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          label: "VNPay",
        }
      case "banking":
      case "bank":
        return {
          icon: Building,
          color: "text-green-400",
          bg: "bg-green-500/20",
          label: "Chuyển khoản",
        }
      case "cod":
      default:
        return {
          icon: Banknote,
          color: "text-orange-400",
          bg: "bg-orange-500/20",
          label: "COD",
        }
    }
  }

  const config = getPaymentConfig(method)
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} border border-gray-600/50`}>
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </div>
  )
}

export default PaymentMethodIcon
