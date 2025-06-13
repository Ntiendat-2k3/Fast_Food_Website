"use client"

import { useRef, useEffect } from "react"
import { MessageCircle } from "lucide-react"
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
      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide" ref={messagesContainerRef}>
        <div className="text-center text-gray-400 mt-8">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>Bắt đầu cuộc trò chuyện với chúng tôi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto scrollbar-hide" ref={messagesContainerRef}>
      {messages.map((msg, index) => (
        <ChatMessage key={msg._id || index} message={msg} baseUrl={baseUrl} />
      ))}
    </div>
  )
}

export default ChatMessages
