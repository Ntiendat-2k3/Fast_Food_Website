"use client"
import { Send, ImageIcon, X, Loader } from "lucide-react"

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSendMessage,
  onImageUpload,
  imagePreview,
  onClearImage,
  loading,
}) => {
  return (
    <div className="p-3 border-t border-gray-700">
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <img
            src={imagePreview || "/placeholder.svg"}
            alt="Preview"
            className="h-20 w-auto rounded-md border border-gray-300"
          />
          <button onClick={onClearImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={onSendMessage} className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          className="flex-1 bg-gray-800 text-white p-2 rounded-l-md focus:outline-none"
          placeholder="Nhập tin nhắn..."
          disabled={loading}
        />
        <label className="bg-gray-700 px-3 py-2 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={onImageUpload}
            className="hidden"
            disabled={loading}
          />
          <ImageIcon size={20} className="text-gray-300" />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  )
}

export default MessageInput
