"use client"

import { Search, Filter, RotateCcw } from "lucide-react"

const InventoryFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onReset }) => {
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "in_stock", label: "Còn hàng" },
    { value: "low_stock", label: "Sắp hết hàng" },
    { value: "out_of_stock", label: "Hết hàng" },
  ]

  return (
    <div className="bg-white dark:bg-dark-light rounded-xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="md:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark text-gray-900 dark:text-white appearance-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </button>
      </div>
    </div>
  )
}

export default InventoryFilters
