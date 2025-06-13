import { FaMoneyBillWave, FaCreditCard, FaMobileAlt } from "react-icons/fa"
import { SiZalo } from "react-icons/si"

/**
 * Component to display an icon based on the payment method
 * @param {Object} props
 * @param {string} props.method - The payment method (cash, card, momo, vnpay, zalopay)
 * @param {string} [props.size='1.2em'] - Icon size
 * @param {string} [props.className=''] - Additional CSS classes
 */
const PaymentMethodIcon = ({ method, size = "1.2em", className = "" }) => {
  const getIcon = () => {
    switch (method?.toLowerCase()) {
      case "cash":
        return <FaMoneyBillWave size={size} className={`text-green-600 ${className}`} />
      case "card":
        return <FaCreditCard size={size} className={`text-blue-600 ${className}`} />
      case "momo":
        return <FaMobileAlt size={size} className={`text-pink-600 ${className}`} />
      case "vnpay":
        return <FaCreditCard size={size} className={`text-blue-500 ${className}`} />
      case "zalopay":
        return <SiZalo size={size} className={`text-blue-700 ${className}`} />
      default:
        return <FaMoneyBillWave size={size} className={`text-gray-600 ${className}`} />
    }
  }

  return <span className="inline-flex items-center">{getIcon()}</span>
}

export default PaymentMethodIcon
