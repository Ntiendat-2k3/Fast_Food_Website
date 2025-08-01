"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, X, Loader2, Sparkles } from "lucide-react"
import { useContext } from "react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

const formatMessage = (content) => {
  // Xử lý markdown cơ bản và emoji
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code class='bg-gray-100 px-1 rounded text-sm'>$1</code>")
    .replace(/^• /gm, "• ")
    .replace(/^\d+\. /gm, (match) => `<span class="font-semibold text-green-600">${match}</span>`)
    .replace(
      /🔥|⭐|💰|👑|💎|📝|🍽️|🎯|💡|🤔|😊|😋|🎁|📱|💬|📋|🎫|🔍|📞/g,
      (emoji) => `<span class="text-lg">${emoji}</span>`,
    )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
}

const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! 👋 Tôi là **GreenEats AI Assistant** - trợ lý ảo thông minh của bạn!\n\n🎯 **Tôi có thể hỗ trợ bạn:**\n• 🍽️ Tư vấn món ăn theo sở thích và ngân sách\n• 📱 Hướng dẫn đặt hàng chi tiết từng bước\n• 🎫 Kiểm tra mã giảm giá và khuyến mãi\n• 📋 Theo dõi trạng thái đơn hàng\n• 💬 Giải đáp mọi thắc mắc về dịch vụ\n• 🔍 Tìm kiếm thông tin nhanh chóng\n\n💡 **Hãy thử hỏi tôi bất cứ điều gì về GreenEats!**\n\nBạn cần hỗ trợ gì hôm nay? 😊",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { url, token, user } = useContext(StoreContext)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return

    // Add user message to chat
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Get user context if logged in
      let userContext = ""
      let userId = null

      if (token && user) {
        userContext = `Người dùng đã đăng nhập: ${user.name}, Email: ${user.email}`
        userId = user._id
      } else {
        userContext = "Khách chưa đăng nhập"
      }

      console.log("Sending AI request:", { message: currentInput, userContext, userId })

      // Send to backend AI endpoint
      const endpoint = token ? "/api/ai/chat-auth" : "/api/ai/chat"
      const headers = token ? { token } : {}

      const response = await axios.post(
        `${url}${endpoint}`,
        {
          message: currentInput,
          userContext: userContext,
          userId: userId,
          history: messages.slice(-6), // Send last 6 messages for context
        },
        { headers },
      )

      console.log("AI response:", response.data)

      if (response.data.success) {
        // Simulate typing effect
        setTimeout(() => {
          setIsTyping(false)
          // Add AI response to chat
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: response.data.reply,
            },
          ])
        }, 1000)
      } else {
        setIsTyping(false)
        // Handle error
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "😔 Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ:\n\n📞 **Hotline:** 1900-1234\n💬 **Chat trực tiếp:** Trang Liên Hệ → Đăng nhập\n📧 **Email:** support@greeneats.com\n\nChúng tôi sẽ hỗ trợ bạn ngay lập tức! 🤝",
          },
        ])
      }
    } catch (error) {
      console.error("Error in AI chat:", error)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ **Kết nối thất bại!**\n\nVui lòng kiểm tra kết nối internet và thử lại.\n\n🆘 **Hỗ trợ khẩn cấp:**\n📞 Hotline: 1900-1234 (24/7)\n💬 Chat admin: Trang Liên Hệ\n\nChúng tôi luôn sẵn sàng hỗ trợ bạn! 💪",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Enhanced quick action buttons
  const quickActions = [
    { text: "🍽️ Xem thực đơn", action: "Tôi muốn xem thực đơn hôm nay" },
    { text: "🎫 Mã giảm giá", action: "Có mã giảm giá nào đang hoạt động không?" },
    { text: "📱 Cách đặt hàng", action: "Hướng dẫn tôi cách đặt hàng chi tiết" },
    { text: "⏰ Thời gian giao", action: "Thời gian giao hàng bao lâu?" },
    { text: "🎯 Gợi ý món ngon", action: "Gợi ý món ăn ngon và phù hợp với tôi" },
    { text: "💰 Combo tiết kiệm", action: "Có combo nào tiết kiệm không?" },
  ]

  const handleQuickAction = (action) => {
    setInput(action)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        key="ai-assistant"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="fixed bottom-4 right-4 w-80 sm:w-96 h-[650px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-4 flex items-center justify-between relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>

          <div className="flex items-center relative z-10">
            <motion.div
              className="bg-white/20 p-2 rounded-full mr-3 relative"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
            >
              <Bot className="text-white" size={24} />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
            </motion.div>
            <div>
              <h3 className="font-bold text-white text-lg">GreenEats AI</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <p className="text-green-100 text-sm font-medium">Trợ lý thông minh</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20 relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white ml-4"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white mr-4 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {message.role === "assistant" ? (
                      <div className="flex items-center">
                        <Bot size={16} className="mr-2 text-green-500" />
                        <span className="font-semibold text-sm text-green-600 dark:text-green-400">GreenEats AI</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        <span className="font-semibold text-sm opacity-90">{user?.name || "Bạn"}</span>
                      </div>
                    )}
                  </div>
                  <div
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />

                  {/* Message decoration */}
                  {message.role === "assistant" && (
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
                  )}
                  {message.role === "user" && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 transform rotate-45"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div variants={scaleIn} initial="hidden" animate="visible" className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white mr-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-2">
                  <Bot size={16} className="mr-2 text-green-500" />
                  <span className="font-semibold text-sm text-green-600 dark:text-green-400">GreenEats AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Đang suy nghĩ...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Actions - show when conversation is short */}
          {messages.length <= 2 && !isLoading && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                <Sparkles size={16} />
                <p className="text-xs font-medium">Câu hỏi gợi ý</p>
                <Sparkles size={16} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 border border-green-200 dark:border-gray-600 rounded-lg p-3 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all transform hover:scale-105 text-gray-700 dark:text-gray-300 font-medium shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {action.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi tôi bất cứ điều gì"
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm transition-all border-0"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
                disabled={isLoading}
                onInput={(e) => {
                  e.target.style.height = "auto"
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                }}
              />

              {/* Character count */}
              <div className="absolute bottom-1 right-12 text-xs text-gray-400">{input.length}/500</div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={isLoading || input.trim() === "" || input.length > 500}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl min-w-[48px]"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </motion.button>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>AI sẵn sàng hỗ trợ</span>
            </div>
            <span>Nhấn Enter để gửi</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AIAssistant
