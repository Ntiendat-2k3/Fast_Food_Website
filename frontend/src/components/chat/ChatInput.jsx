"use client"

import { Send, ImageIcon, Smile } from "lucide-react"
import { useState } from "react"

const ChatInput = ({
  newMessage,
  setNewMessage,
  selectedImage,
  setSelectedImage,
  handleSendMessage,
  handleImageUpload,
  loading,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const quickReplies = ["Xin chào! 👋", "Cảm ơn bạn", "Tôi cần hỗ trợ", "Có thể giúp tôi không?"]

  const handleQuickReply = (reply) => {
    setNewMessage(reply)
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
  }

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t border-yellow-500/20 p-4">
      {/* Quick Replies */}
      {!newMessage && !selectedImage && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 rounded-full text-yellow-400 text-sm transition-all duration-200 hover:scale-105"
                disabled={loading}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="mb-3 p-3 bg-slate-600/30 rounded-lg border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <ImageIcon size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium truncate max-w-48">{selectedImage.name}</p>
                <p className="text-gray-400 text-xs">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={removeSelectedImage}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
              disabled={loading}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
        {/* Main Input Container */}
        <div className="flex-1 relative">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-slate-600/50 border border-slate-500/50 focus:border-yellow-500/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 resize-none transition-all duration-200 backdrop-blur-sm"
            placeholder="Nhập tin nhắn của bạn..."
            disabled={loading}
            rows="1"
            style={{ minHeight: "48px", maxHeight: "120px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors p-1"
            disabled={loading}
          >
            <Smile size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Image Upload Button */}
          <label className="bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/50 hover:border-yellow-500/50 rounded-xl p-3 cursor-pointer transition-all duration-200 group">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
            <ImageIcon size={20} className="text-gray-400 group-hover:text-yellow-400 transition-colors" />
          </label>

          {/* Send Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-slate-900 rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/25 transform hover:scale-105 active:scale-95"
            disabled={loading || (!newMessage.trim() && !selectedImage)}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Typing Indicator */}
      {loading && (
        <div className="mt-2 flex items-center space-x-2 text-yellow-400 text-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <span>Đang gửi...</span>
        </div>
      )}
    </div>
  )
}

export default ChatInput
