import OrderHeader from "./OrderHeader"
import OrderItemsList from "./OrderItemsList"
import OrderSummary from "./OrderSummary"
import { Clock, Truck, CheckCircle, Package } from "lucide-react"

const OrderCard = ({ order, url, onStatusChange, formatDate, formatCurrency, SHIPPING_FEE }) => {
  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return <Clock size={18} className="text-yellow-500" />
      case "Đang giao hàng":
        return <Truck size={18} className="text-blue-500" />
      case "Đã giao":
      case "Đã giao hàng":
        return <CheckCircle size={18} className="text-green-500" />
      default:
        return <Package size={18} className="text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Đang giao hàng":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "Đã giao":
      case "Đã giao hàng":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <div className="bg-white dark:bg-dark md:rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-dark-lighter">
      <OrderHeader
        order={order}
        onStatusChange={onStatusChange}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OrderItemsList items={order.items} url={url} formatCurrency={formatCurrency} />
          <OrderSummary order={order} SHIPPING_FEE={SHIPPING_FEE} formatCurrency={formatCurrency} />
        </div>
      </div>
    </div>
  )
}

export default OrderCard
