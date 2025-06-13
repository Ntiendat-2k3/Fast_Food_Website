"use client"

import { MoreVertical } from "lucide-react"

const ChatHeader = ({ user, onToggleGallery }) => {
  if (!user) return null

  return (
    <div className="bg-gray-800 p-3 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 font-medium">{user.userName}</div>
        </div>
        <button
          onClick={onToggleGallery}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          title="Xem ảnh đã gửi"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  )
}

export default ChatHeader
