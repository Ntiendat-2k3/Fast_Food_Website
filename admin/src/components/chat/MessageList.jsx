"use client"

import { useState } from "react"
import { Trash2, Download, Eye } from "lucide-react"

const MessageList = ({ messages, messagesLoading, onDeleteMessage, messagesEndRef }) => {
  const [hoveredMessage, setHoveredMessage] = useState(null)

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua"
    } else {
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  const groupMessagesByDate = (messages) => {
    const groups = {}
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    return groups
  }

  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, "_blank")
  }

  const handleDownloadImage = (imageUrl, fileName) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = fileName || "image.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Đang tải tin nhắn...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có tin nhắn nào</h3>
          <p className="text-gray-500 dark:text-gray-400">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</p>
        </div>
      </div>
    )
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-6">
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{formatDate(date)}</span>
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-4">
            {dateMessages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.isFromAdmin ? "justify-end" : "justify-start"}`}
                onMouseEnter={() => setHoveredMessage(message._id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg relative group`}>
                  {/* Message Content */}
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                      message.isFromAdmin
                        ? "bg-blue-500 text-white rounded-br-md"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md"
                    }`}
                  >
                    {message.type === "text" && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}

                    {message.type === "image" && (
                      <div className="relative">
                        <img
                          src={`http://localhost:4000${message.content}`}
                          alt="Hình ảnh"
                          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImageClick(`http://localhost:4000${message.content}`)}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleImageClick(`http://localhost:4000${message.content}`)}
                              className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                              title="Xem ảnh"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadImage(
                                  `http://localhost:4000${message.content}`,
                                  `image-${message._id}.jpg`,
                                )
                              }
                              className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                              title="Tải xuống"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  {hoveredMessage === message._id && (
                    <div
                      className={`absolute top-0 ${message.isFromAdmin ? "-left-10" : "-right-10"} flex items-center space-x-1`}
                    >
                      <button
                        onClick={() => onDeleteMessage(message._id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Xóa tin nhắn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {/* Message Time */}
                  <div className={`mt-1 ${message.isFromAdmin ? "text-right" : "text-left"}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(message.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
