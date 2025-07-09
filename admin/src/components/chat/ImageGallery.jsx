"use client"

import { useState } from "react"
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react"

const ImageGallery = ({ messages, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const downloadImage = (imageUrl, fileName) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = fileName || "image.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length)
  }

  if (messages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">Không có hình ảnh nào</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Đóng
          </button>
        </div>
      </div>
    )
  }

  const currentMessage = messages[currentIndex]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 z-10"
        >
          <X size={20} />
        </button>

        {/* Navigation Buttons */}
        {messages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image */}
        <div className="max-w-4xl max-h-4xl">
          <img
            src={currentMessage.content || "/placeholder.svg"}
            alt="Gallery image"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Image Info */}
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                {currentIndex + 1} / {messages.length}
              </p>
              <p className="text-xs opacity-75">{new Date(currentMessage.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <button
              onClick={() => downloadImage(currentMessage.content, `image-${currentMessage._id}.jpg`)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
            >
              <Download size={16} />
              <span>Tải về</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageGallery
