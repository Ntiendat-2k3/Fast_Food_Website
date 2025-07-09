"use client"

import { Users } from "lucide-react"

const UserList = ({ users, selectedUser, onUserSelect, loading }) => {
  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Vừa xong"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`
    } else {
      return date.toLocaleDateString("vi-VN")
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào</p>
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
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {user.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {user.unreadCount > 9 ? "9+" : user.unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">{user.name}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(user.latestMessageTime)}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              {user.latestMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                  {user.latestMessage.length > 50 ? user.latestMessage.substring(0, 50) + "..." : user.latestMessage}
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
