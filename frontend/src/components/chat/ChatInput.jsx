"use client"

import { Send, ImageIcon } from "lucide-react"

const ChatInput = ({
  newMessage,
  setNewMessage,
  selectedImage,
  setSelectedImage,
  handleSendMessage,
  handleImageUpload,
  loading,
}) => {
  return (
    <div className="p-4 border-t border-slate-700">
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border border-slate-600 rounded-l-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-slate-700/50 text-white placeholder-gray-400"
          placeholder="Nhập tin nhắn..."
          disabled={loading}
        />
        <label className="bg-slate-700/50 border-t border-b border-slate-600 px-3 py-3 cursor-pointer hover:bg-slate-600/50 transition-colors">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
          <ImageIcon size={20} className="text-gray-400" />
        </label>
        <button
          type="submit"
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 px-4 py-3 rounded-r-xl transition-all duration-300 disabled:opacity-50"
          disabled={loading}
        >
          <Send size={20} />
        </button>
      </form>
      {selectedImage && <div className="mt-2 text-sm text-gray-400 truncate">Đã chọn: {selectedImage.name}</div>}
    </div>
  )
}

export default ChatInput
