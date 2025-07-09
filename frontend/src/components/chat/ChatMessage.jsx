"use client"

import { useState } from "react"
import { Download, Eye, User, Shield } from "lucide-react"

const ChatMessage = ({ message, baseUrl }) => {
  const [imageError, setImageError] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isFromUser = message.sender === "user"
  const isFromAdmin = message.sender === "admin"

  const handleImageClick = () => {
    setShowFullImage(true)
  }

  const handleDownload = (imageUrl, fileName) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = fileName || "image.jpg"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getImageUrl = () => {
    if (message.image) {
      return `${baseUrl}/uploads/messages/${message.image}`
    }
    return null
  }

  return (
    <>
      <div className={`flex mb-6 ${isFromUser ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-xs lg:max-w-md group relative ${isFromUser ? "order-2" : "order-1"}`}>
          {/* Avatar */}
          <div className={`flex items-end space-x-2 ${isFromUser ? "flex-row-reverse space-x-reverse" : ""}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isFromUser
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-yellow-400 to-yellow-600"
              }`}
            >
              {isFromUser ? <User size={16} className="text-white" /> : <Shield size={16} className="text-slate-900" />}
            </div>

            {/* Message Bubble */}
            <div className={`relative ${isFromUser ? "mr-2" : "ml-2"}`}>
              <div
                className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border ${
                  isFromUser
                    ? "bg-gradient-to-br from-blue-500/90 to-purple-600/90 text-white border-blue-400/30 rounded-br-md"
                    : "bg-gradient-to-br from-slate-700/90 to-slate-600/90 text-white border-yellow-500/30 rounded-bl-md"
                }`}
              >
                {/* Admin Badge */}
                {isFromAdmin && (
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-xs text-yellow-400 font-medium">Hỗ trợ viên</span>
                  </div>
                )}

                {/* Text Content */}
                {message.content && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                )}

                {/* Image Content */}
                {message.image && !imageError && (
                  <div className="mt-2 relative group/image">
                    <img
                      src={getImageUrl() || "/placeholder.svg"}
                      alt="Attached image"
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-md border border-white/10"
                      onClick={handleImageClick}
                      onError={() => setImageError(true)}
                    />

                    {/* Image Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={handleImageClick}
                          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 p-2 rounded-full transition-all duration-200 shadow-lg transform hover:scale-110"
                          title="Xem ảnh"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(getImageUrl(), message.image)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 p-2 rounded-full transition-all duration-200 shadow-lg transform hover:scale-110"
                          title="Tải xuống"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Error State */}
                {message.image && imageError && (
                  <div className="mt-2 p-4 bg-slate-600/50 rounded-lg text-center border border-red-500/30">
                    <p className="text-sm text-red-400">Không thể tải hình ảnh</p>
                  </div>
                )}

                {/* Message tail */}
                <div
                  className={`absolute bottom-0 w-3 h-3 transform rotate-45 ${
                    isFromUser
                      ? "-right-1 bg-gradient-to-br from-blue-500 to-purple-600"
                      : "-left-1 bg-gradient-to-br from-slate-700 to-slate-600"
                  }`}
                ></div>
              </div>

              {/* Message Info */}
              <div className={`mt-1 px-1 ${isFromUser ? "text-right" : "text-left"}`}>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>{formatTime(message.createdAt)}</span>
                  {isFromAdmin && message.adminName && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-yellow-400">{message.adminName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status */}
          {isFromUser && (
            <div className="absolute -bottom-1 -right-1">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-slate-800 rounded-full shadow-lg"></div>
            </div>
          )}
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && message.image && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-4xl">
            <img
              src={getImageUrl() || "/placeholder.svg"}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-yellow-500/30"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Close Button */}
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 rounded-full w-10 h-10 flex items-center justify-center hover:from-yellow-500 hover:to-yellow-700 transition-all shadow-lg font-bold text-lg"
            >
              ×
            </button>

            {/* Download Button */}
            <button
              onClick={() => handleDownload(getImageUrl(), message.image)}
              className="absolute bottom-4 right-4 bg-gradient-to-br from-yellow-400 to-yellow-600 text-slate-900 px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all shadow-lg flex items-center space-x-2 font-medium"
            >
              <Download size={16} />
              <span>Tải xuống</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatMessage
