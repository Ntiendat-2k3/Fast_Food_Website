"use client"

import { Send, ImageIcon } from "lucide-react"

const MessageInput = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  onKeyPress,
  sending,
  imagePreview,
  onImageUpload,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-20 rounded" />
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* File Input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

        {/* Image Upload Button */}
        <button
          onClick={onImageUpload}
          disabled={sending}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          title="Gửi hình ảnh"
        >
          <ImageIcon size={20} />
        </button>

        {/* Message Input */}
        <div className="flex-1">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Nhập tin nhắn..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows="1"
            style={{ minHeight: "40px", maxHeight: "120px" }}
            disabled={sending}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || sending}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Gửi tin nhắn"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  )
}

export default MessageInput
