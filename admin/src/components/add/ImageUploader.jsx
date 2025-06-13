"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"

const ImageUploader = ({ onImageChange }) => {
  const [imagePreview, setImagePreview] = useState(null)
  const [image, setImage] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      onImageChange(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(false)
    setImagePreview(null)
    onImageChange(false)
  }

  return (
    <div className="mb-4 md:mb-5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hình ảnh sản phẩm</label>
      <div className="flex items-center justify-center">
        <div className="w-full">
          {imagePreview ? (
            <div className="relative mb-4">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="h-48 md:h-56 w-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 md:h-56 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-dark hover:bg-gray-100 dark:hover:bg-dark-lighter transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo và thả
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG hoặc JPEG (Tối đa 5MB)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
                required
              />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageUploader
