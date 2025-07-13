"use client"
import { PackageX, Plus } from "lucide-react"

const EmptyOrderState = () => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-neutral-900 rounded-xl shadow-lg text-center min-h-[400px] overflow-hidden border border-neutral-800">
      {/* Animated background circles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-48 h-48 bg-amber-500 rounded-full opacity-10 -top-10 -left-10 animate-float-slow"></div>
        <div className="absolute w-64 h-64 bg-yellow-500 rounded-full opacity-10 -bottom-20 -right-20 animate-float-medium"></div>
        <div className="absolute w-32 h-32 bg-amber-400 rounded-full opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-fast"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="p-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mb-6 shadow-xl">
          <PackageX className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Không có đơn hàng nào</h2>
        <p className="text-gray-300 mb-6 max-w-md">
          Có vẻ như chưa có đơn hàng nào được tạo hoặc không khớp với tiêu chí tìm kiếm của bạn.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-lg shadow-md hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tạo đơn hàng mới
        </button>
      </div>
    </div>
  )
}

export default EmptyOrderState
