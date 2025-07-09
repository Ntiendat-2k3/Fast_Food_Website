"use client"

import { useRef, useEffect } from "react"
import { MessageCircle, Sparkles } from "lucide-react"
import ChatMessage from "./ChatMessage"

const ChatMessages = ({ messages, baseUrl }) => {
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div
        className="flex-1 p-6 overflow-y-auto scrollbar-hide bg-gradient-to-b from-slate-900/50 to-slate-800/50"
        ref={messagesContainerRef}
      >
        <div className="text-center mt-16">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-yellow-500/30">
              <MessageCircle size={32} className="text-yellow-400" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles size={16} className="text-yellow-400 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">Chào mừng bạn!</h3>
          <p className="text-gray-400 mb-4">Bắt đầu cuộc trò chuyện với đội ngũ hỗ trợ của chúng tôi</p>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm">
              Hỗ trợ 24/7
            </span>
            <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm">
              Phản hồi nhanh
            </span>
            <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm">
              Tư vấn miễn phí
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex-1 p-4 overflow-y-auto scrollbar-hide bg-gradient-to-b from-slate-900/30 to-slate-800/30"
      ref={messagesContainerRef}
    >
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={msg._id || index} message={msg} baseUrl={baseUrl} />
        ))}
      </div>
    </div>
  )
}

export default ChatMessages
