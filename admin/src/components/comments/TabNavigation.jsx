"use client"
import { MessageSquare, Bell, UserX } from "lucide-react"

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6 overflow-x-auto">
      <button
        className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap ${
          activeTab === "comments"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
        onClick={() => setActiveTab("comments")}
      >
        <MessageSquare className="mr-2" size={16} />
        Đánh giá sản phẩm
      </button>
      <button
        className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap ${
          activeTab === "blacklist"
            ? "text-primary border-b-2 border-primary"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
        onClick={() => setActiveTab("blacklist")}
      >
        <UserX className="mr-2" size={16} />
        Danh sách đen
      </button>
    </div>
  )
}

export default TabNavigation
