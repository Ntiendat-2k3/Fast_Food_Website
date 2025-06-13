"use client"

import { Search } from "lucide-react"

const OrderSearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm theo tên, SĐT, mã đơn hàng hoặc mã giảm giá..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

export default OrderSearchBar
