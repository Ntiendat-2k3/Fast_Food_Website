"use client"
import { ChevronDown } from "lucide-react"

const OrderStatusFilter = ({ onFilter, currentFilter }) => {
  const statusOptions = [
    { value: "all", label: "Tất cả", count: null },
    { value: "Đang xử lý", label: "Đang xử lý", count: null },
    { value: "Đang giao hàng", label: "Đang giao hàng", count: null },
    { value: "Đã giao", label: "Đã giao", count: null },
    { value: "Đã hủy", label: "Đã hủy", count: null },
  ]

  const getCurrentLabel = () => {
    const current = statusOptions.find((option) => option.value === currentFilter)
    return current ? current.label : "Tất cả"
  }

  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => onFilter(e.target.value)}
        className="appearance-none px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 cursor-pointer pr-10"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}

export default OrderStatusFilter
