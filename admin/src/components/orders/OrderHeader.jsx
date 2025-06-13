"use client"

import { Package, Calendar } from "lucide-react"

const OrderHeader = ({ order, onStatusChange, formatDate, getStatusColor, getStatusIcon }) => {
  return (
    <div className="bg-gray-50 dark:bg-dark-lighter p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-dark-lighter">
      <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <Package size={16} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-1">
            <p className="text-dark dark:text-white font-medium text-sm">#{order._id.slice(-6)}</p>
            <span className="mx-1 text-gray-400 hidden sm:inline">•</span>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
              <Calendar size={12} className="mr-1 flex-shrink-0" />
              {formatDate(order.date)}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
            {order.address.name} • {order.address.phone}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
        <select
          onChange={(event) => onStatusChange(event, order._id)}
          value={order.status}
          className="text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-1 px-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đang chuẩn bị đồ">Đang chuẩn bị đồ</option>
          <option value="Đang giao hàng">Đang giao hàng</option>
          <option value="Đã giao">Đã giao</option>
        </select>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}
        >
          {getStatusIcon(order.status)}
          <span className="ml-1">{order.status}</span>
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
          {order.paymentStatus || "Chưa thanh toán"}
        </span>
      </div>
    </div>
  )
}

// Helper function for payment status color
const getPaymentStatusColor = (status) => {
  switch (status) {
    case "Đã thanh toán":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    case "Đang xử lý":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    case "Thanh toán thất bại":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    case "Chưa thanh toán":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
  }
}

export default OrderHeader
