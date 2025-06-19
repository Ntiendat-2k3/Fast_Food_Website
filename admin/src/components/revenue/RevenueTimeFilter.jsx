"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"

const RevenueTimeFilter = ({ period, setPeriod, year, setYear, month, setMonth, onApply }) => {
  const [isOpen, setIsOpen] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ]

  const getPeriodLabel = () => {
    try {
      switch (period) {
        case "day":
          return `Ngày trong ${months.find((m) => m.value === month)?.label || "Tháng"} ${year}`
        case "month":
          return `Tháng trong năm ${year}`
        case "year":
          return "Theo năm"
        default:
          return "Chọn thời gian"
      }
    } catch (error) {
      return "Chọn thời gian"
    }
  }

  const handleYearChange = (e) => {
    try {
      const newYear = Number.parseInt(e.target.value, 10)
      if (!isNaN(newYear)) {
        setYear(newYear)
      }
    } catch (error) {
      console.error("Error parsing year:", error)
    }
  }

  const handleMonthChange = (e) => {
    try {
      const newMonth = Number.parseInt(e.target.value, 10)
      if (!isNaN(newMonth)) {
        setMonth(newMonth)
      }
    } catch (error) {
      console.error("Error parsing month:", error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Calendar size={16} className="mr-2" />
        {getPeriodLabel()}
        <ChevronDown size={16} className="ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-light rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Chọn khoảng thời gian</h3>

            {/* Period Selection */}
            <div className="mb-4">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Loại thống kê</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "day", label: "Theo ngày" },
                  { value: "month", label: "Theo tháng" },
                  { value: "year", label: "Theo năm" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPeriod(option.value)}
                    className={`px-3 py-2 text-xs rounded-md transition-colors ${
                      period === option.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Selection */}
            {(period === "day" || period === "month") && (
              <div className="mb-4">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Năm</label>
                <select
                  value={year}
                  onChange={handleYearChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Month Selection */}
            {period === "day" && (
              <div className="mb-4">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Tháng</label>
                <select
                  value={month}
                  onChange={handleMonthChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (onApply) onApply()
                  setIsOpen(false)
                }}
                className="px-4 py-2 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueTimeFilter
