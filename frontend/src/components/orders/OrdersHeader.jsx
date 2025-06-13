"use client"
import { Sparkles, Search } from "lucide-react"

const OrdersHeader = ({ searchTerm, setSearchTerm, hasOrders }) => {
  return (
    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Sparkles className="text-primary mr-3" size={24} />
          <h1 className="text-2xl font-bold text-white">Đơn hàng của tôi</h1>
        </div>

        {/* Search Bar */}
        {hasOrders && (
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full rounded-xl border border-slate-600 bg-slate-700/50 py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersHeader
