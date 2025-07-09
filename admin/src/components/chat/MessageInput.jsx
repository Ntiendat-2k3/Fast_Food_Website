"use client"

import { useState } from "react"
import { Send, ImageIcon, X, Smile } from "lucide-react"

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
  const [showQuickReplies, setShowQuickReplies] = useState(false)

  const quickReplies = [
    "Xin chào! Tôi có thể giúp gì cho bạn?",
    "Cảm ơn bạn đã liên hệ với chúng tôi",
    "Chúng tôi sẽ xử lý yêu cầu của bạn ngay",
    "Bạn có thể cung cấp thêm thông tin không?",
    "Cảm ơn bạn đã phản hồi",
    "Chúc bạn một ngày tốt lành!",
  ]

  const handleQuickReply = (reply) => {
    setNewMessage(reply)
    setShowQuickReplies(false)
  }

  const removeImagePreview = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    // Call parent component to clear image
    onFileChange({ target: { files: [] } })
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Quick Replies */}
      {showQuickReplies && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative inline-block">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="max-w-32 max-h-32 rounded-lg object-cover"
            />
            <button
              onClick={removeImagePreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={onImageUpload}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Gửi hình ảnh"
            >
              <ImageIcon size={20} />
            </button>

            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                showQuickReplies
                  ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
              title="Câu trả lời nhanh"
            >
              <Smile size={20} />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ minHeight: "40px", maxHeight: "120px" }}
              onInput={(e) => {
                e.target.style.height = "auto"
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={onSendMessage}
            disabled={(!newMessage.trim() && !imagePreview) || sending}
            className={`p-2 rounded-lg transition-colors ${
              (!newMessage.trim() && !imagePreview) || sending
                ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
            }`}
            title="Gửi tin nhắn"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {/* File Input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />

        {/* Typing Indicator */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Nhấn Enter để gửi, Shift + Enter để xuống dòng
        </div>
      </div>
    </div>
  )
}

export default MessageInput
