"use client"

import { Package, Tag } from "lucide-react"

const RevenueTabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "category",
      label: "Theo danh mục",
      icon: Tag,
      description: "Doanh thu theo từng danh mục sản phẩm",
    },
    {
      id: "product",
      label: "Theo sản phẩm",
      icon: Package,
      description: "Doanh thu theo từng sản phẩm cụ thể",
    },
  ]

  return (
    <div className="mb-4">
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-dark text-primary shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Icon size={16} className="mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RevenueTabNavigation
