"use client"

import { Package, Plus, RefreshCw } from "lucide-react"

const EmptyOrderState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-gray-700">
          <Package className="w-10 h-10 text-gray-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <Plus className="w-3 h-3 text-black" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy đơn hàng</h3>
      <p className="text-gray-400 text-center mb-6 max-w-md">
        Không có đơn hàng nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc kiểm tra lại sau.
      </p>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300">
          <RefreshCw className="w-4 h-4" />
          Làm mới đơn hàng
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">Đơn hàng sẽ xuất hiện ở đây khi khách hàng bắt đầu đặt hàng</p>
      </div>
    </div>
  )
}

export default EmptyOrderState
