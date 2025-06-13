"use client"

import { PieChart, BarChart } from "lucide-react"

const RevenueTabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-4 md:mb-6 overflow-x-auto">
      <div className="flex border-b border-gray-200 dark:border-dark-lighter min-w-[300px]">
        <button
          onClick={() => setActiveTab("category")}
          className={`py-2.5 px-4 sm:px-6 font-medium text-sm whitespace-nowrap ${
            activeTab === "category" ? "border-b-2 border-primary text-primary" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <PieChart size={16} className="inline mr-2" />
          Theo danh mục
        </button>
        <button
          onClick={() => setActiveTab("product")}
          className={`py-2.5 px-4 sm:px-6 font-medium text-sm whitespace-nowrap ${
            activeTab === "product" ? "border-b-2 border-primary text-primary" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <BarChart size={16} className="inline mr-2" />
          Theo sản phẩm
        </button>
      </div>
    </div>
  )
}

export default RevenueTabNavigation
