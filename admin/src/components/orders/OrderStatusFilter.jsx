"use client"

import { Filter, RefreshCw } from "lucide-react"

const OrderStatusFilter = ({ statusFilter, setStatusFilter, onRefresh }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Đang chuẩn bị đồ">Đang chuẩn bị đồ</option>
          <option value="Đang giao hàng">Đang giao hàng</option>
          <option value="Đã giao">Đã giao</option>
        </select>
      </div>
      <button
        onClick={onRefresh}
        className="p-2 bg-gray-100 dark:bg-dark-lighter rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark transition-colors flex-shrink-0"
        title="Refresh"
      >
        <RefreshCw size={18} />
      </button>
    </div>
  )
}

export default OrderStatusFilter
