"use client"

import { useState } from "react"
import { Trash2, Download, Eye } from "lucide-react"

const MessageList = ({ messages, messagesLoading, onDeleteMessage, messagesEndRef }) => {
  const [selectedImage, setSelectedImage] = useState(null)

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
      return date.toLocaleDateString("vi-VN")
    }
  }

  const downloadImage = (imageUrl, fileName) => {
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "admin"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  {message.type === "image" ? (
                    <div className="space-y-2">
                      <img
                        src={message.content || "/placeholder.svg"}
                        alt="Sent image"
                        className="max-w-full h-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(message.content)}
                      />
                      <div className="flex items-center space-x-2 text-sm">
                        <button
                          onClick={() => setSelectedImage(message.content)}
                          className="flex items-center space-x-1 hover:underline"
                        >
                          <Eye size={14} />
                          <span>Xem</span>
                        </button>
                        <button
                          onClick={() => downloadImage(message.content, `image-${message._id}.jpg`)}
                          className="flex items-center space-x-1 hover:underline"
                        >
                          <Download size={14} />
                          <span>Tải về</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
                    {message.sender === "admin" && (
                      <button
                        onClick={() => onDeleteMessage(message._id)}
                        className="ml-2 p-1 hover:bg-red-600 rounded transition-colors"
                        title="Xóa tin nhắn"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default MessageList
