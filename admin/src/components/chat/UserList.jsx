"use client"

import { Users, Clock } from "lucide-react"

const UserList = ({ users, selectedUser, onUserSelect, loading }) => {
  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = (now - date) / (1000 * 60)
    const diffInHours = diffInMinutes / 60
    const diffInDays = diffInHours / 24

    if (diffInMinutes < 1) {
      return "Vừa xong"
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} phút trước`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} ngày trước`
    } else {
      return date.toLocaleDateString("vi-VN")
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có tin nhắn nào</h3>
          <p className="text-gray-500 dark:text-gray-400">Tin nhắn từ khách hàng sẽ xuất hiện ở đây</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => onUserSelect(user)}
          className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            selectedUser?._id === user._id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500" : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              {user.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-md">
                  {user.unreadCount > 9 ? "9+" : user.unreadCount}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">{user.name || "Người dùng"}</h4>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="mr-1" />
                  <span>{formatTime(user.latestMessageTime)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">{user.email}</p>

              {user.latestMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {user.latestMessage.length > 40 ? user.latestMessage.substring(0, 40) + "..." : user.latestMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserList
