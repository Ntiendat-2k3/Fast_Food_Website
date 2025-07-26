"use client"
import { UserX, Star } from "lucide-react"

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-slate-600 dark:border-slate-600 mb-4 md:mb-6 overflow-x-auto bg-slate-800 rounded-t-xl">
      <button
        className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap transition-all duration-300 ${
          activeTab === "comments"
            ? "text-yellow-400 border-b-2 border-yellow-400 bg-slate-700"
            : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
        }`}
        onClick={() => setActiveTab("comments")}
      >
        <Star className="mr-2" size={16} />
        Đánh giá sản phẩm
      </button>
      <button
        className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap transition-all duration-300 ${
          activeTab === "blacklist"
            ? "text-yellow-400 border-b-2 border-yellow-400 bg-slate-700"
            : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
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
