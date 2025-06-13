"use client"

import { X } from "lucide-react"

const ImageGallery = ({ isOpen, onClose, images, onSelectImage }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium">Ảnh đã gửi</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {images.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>Không có ảnh nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onSelectImage(image.url)}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt="Shared image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Cpath d='M100 70 A10 10 0 1 0 100 90 A10 10 0 1 0 100 70 Z' fill='%23888'/%3E%3Cpath d='M80 120 L100 100 L120 120 L130 110 L140 130 L60 130 L70 110 Z' fill='%23888'/%3E%3C/svg%3E"
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageGallery
