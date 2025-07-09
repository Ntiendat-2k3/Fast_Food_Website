"use client"

import { MessageSquare, Users, Clock } from "lucide-react"

const ChatHeader = () => {
  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-yellow-500/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <MessageSquare size={20} className="text-slate-900" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse"></div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Hỗ trợ khách hàng</h3>
            <div className="flex items-center space-x-2 text-sm text-yellow-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Đang hoạt động</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center space-x-1">
            <Users size={16} className="text-yellow-400" />
            <span>24/7</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={16} className="text-yellow-400" />
            <span>Phản hồi nhanh</span>
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="mt-3 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
    </div>
  )
}

export default ChatHeader
