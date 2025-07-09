"use client"

import { useState } from "react"
import { X, Download, ChevronLeft, ChevronRight, Calendar } from "lucide-react"

const ImageGallery = ({ messages, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const imageMessages = messages.filter((msg) => msg.type === "image")

  if (imageMessages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có hình ảnh nào</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Các hình ảnh được chia sẻ trong cuộc trò chuyện sẽ xuất hiện ở đây
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentImage = imageMessages[selectedImageIndex]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = (imageUrl, fileName) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = fileName || "image.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % imageMessages.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + imageMessages.length) % imageMessages.length)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose()
    } else if (e.key === "ArrowRight") {
      nextImage()
    } else if (e.key === "ArrowLeft") {
      prevImage()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium">Thư viện ảnh</h3>
              <span className="text-sm text-gray-300">
                {selectedImageIndex + 1} / {imageMessages.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handleDownload(`http://localhost:4000${currentImage.content}`, `image-${currentImage._id}.jpg`)
                }
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Tải xuống"
              >
                <Download size={20} />
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Đóng"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center p-16">
          <div className="relative max-w-full max-h-full">
            <img
              src={`http://localhost:4000${currentImage.content}`}
              alt="Hình ảnh"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Navigation Arrows */}
            {imageMessages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
                  title="Ảnh trước"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-colors"
                  title="Ảnh tiếp theo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span className="text-sm">{formatDate(currentImage.createdAt)}</span>
            </div>

            <div className="text-sm text-gray-300">
              {currentImage.isFromAdmin ? "Gửi bởi Admin" : "Gửi bởi Khách hàng"}
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {imageMessages.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-lg p-2">
            <div className="flex space-x-2 max-w-md overflow-x-auto">
              {imageMessages.map((msg, index) => (
                <button
                  key={msg._id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex ? "border-blue-500" : "border-transparent hover:border-white"
                  }`}
                >
                  <img
                    src={`http://localhost:4000${msg.content}`}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
