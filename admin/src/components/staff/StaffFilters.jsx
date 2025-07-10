"use client"

import { Filter, Users, UserCheck, UserX } from "lucide-react"

const StaffFilters = ({ statusFilter, onFilterChange }) => {
  const filters = [
    { value: "all", label: "Tất cả", icon: Users },
    { value: "active", label: "Hoạt động", icon: UserCheck },
    { value: "inactive", label: "Không hoạt động", icon: UserX },
  ]

  return (
    <div className="flex items-center space-x-2">
      <Filter size={16} className="text-gray-400" />
      <div className="flex space-x-1">
        {filters.map((filter) => {
          const Icon = filter.icon
          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? "bg-gradient-golden text-white"
                  : "bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border"
              }`}
            >
              <Icon size={14} />
              <span>{filter.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default StaffFilters
