"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { StoreContext } from "../context/StoreContext"
import { Send, ImageIcon, Loader, X, ArrowDown } from "lucide-react"
import axios from "axios"

const ChatBox = () => {
  const { url, token, user, setShowLogin } = useContext(StoreContext)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loadedImages, setLoadedImages] = useState({})
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Scroll management refs
  const userScrolling = useRef(false)
  const scrollTimeout = useRef(null)
  const lastMessageCount = useRef(0)
  const shouldAutoScroll = useRef(true)
  const programmaticScroll = useRef(false)

  // Fetch messages when component mounts or token changes
  useEffect(() => {
    if (token) {
      console.log("Token available, fetching messages...")
      fetchMessages(false) // Initial load
      // Set up polling for new messages every 3 seconds
      const intervalId = setInterval(() => {
        if (!userScrolling.current) {
          console.log("Polling for new messages...")
          fetchMessages(true) // Polling
        }
      }, 3000)
      return () => clearInterval(intervalId)
    }
  }, [token])

  // Check if user is at bottom of scroll
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    return scrollHeight - scrollTop - clientHeight < 50
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current || programmaticScroll.current) return

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    // Mark as user scrolling immediately
    userScrolling.current = true

    const bottom = isAtBottom()
    shouldAutoScroll.current = bottom
    setIsNearBottom(bottom)

    if (bottom) {
      setUnreadCount(0)
      setShowScrollButton(false)
    } else {
      setShowScrollButton(unreadCount > 0)
    }

    // Reset user scrolling flag after they stop scrolling
    scrollTimeout.current = setTimeout(() => {
      userScrolling.current = false
    }, 2000) // Longer timeout to prevent interference
  }

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => {
        container.removeEventListener("scroll", handleScroll)
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current)
        }
      }
    }
  }, [unreadCount])

  const fetchMessages = async (isPolling = false) => {
    if (!token) {
      console.log("No token available")
      return
    }

    try {
      if (!isPolling) {
        setLoading(true)
      }

      console.log("Fetching messages with token:", token.substring(0, 10) + "...")
      const response = await axios.get(`${url}/api/message/my-messages`, {
        headers: { token },
      })

      console.log("Fetch messages response:", response.data)

      if (response.data.success) {
        const newMessages = response.data.data
        const prevMessageCount = lastMessageCount.current

        console.log(`Received ${newMessages.length} messages, previous count: ${prevMessageCount}`)

        // Only update if there are actually new messages or it's not polling
        if (!isPolling || newMessages.length !== prevMessageCount) {
          const wasAtBottom = isAtBottom()

          setMessages(newMessages)
          lastMessageCount.current = newMessages.length

          // Only auto-scroll if:
          // 1. User was at bottom AND not manually scrolling
          // 2. OR it's their own message
          // 3. OR it's the first load
          if (
            (!isPolling && wasAtBottom) ||
            (wasAtBottom && !userScrolling.current && shouldAutoScroll.current) ||
            (prevMessageCount < newMessages.length && newMessages[newMessages.length - 1]?.sender === "user")
          ) {
            setTimeout(() => scrollToBottom(), 100)
          } else if (isPolling && prevMessageCount < newMessages.length) {
            const newCount = newMessages.length - prevMessageCount
            setUnreadCount((prev) => prev + newCount)
            setShowScrollButton(true)
          }
        }
      } else {
        console.error("Failed to fetch messages:", response.data.message)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      if (error.response?.status === 401) {
        console.log("Token expired or invalid")
      }
    } finally {
      if (!isPolling) {
        setLoading(false)
      }
    }
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current && !userScrolling.current) {
      programmaticScroll.current = true
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setShowScrollButton(false)
      setUnreadCount(0)
      shouldAutoScroll.current = true
      setTimeout(() => {
        programmaticScroll.current = false
      }, 200)
    }
  }

  // Auto scroll to bottom when messages first load
  useEffect(() => {
    if (messages.length > 0 && !loading && shouldAutoScroll.current) {
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [messages.length, loading])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!token) {
      setShowLogin(true)
      return
    }

    if ((!newMessage.trim() && !selectedImage) || sending) {
      return
    }

    try {
      setSending(true)

      const formData = new FormData()
      if (newMessage.trim()) {
        formData.append("content", newMessage.trim())
      }

      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      console.log("Sending message:", { content: newMessage, hasImage: !!selectedImage })

      const response = await axios.post(`${url}/api/message/send`, formData, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Send message response:", response.data)

      if (response.data.success) {
        // Add the new message to the local state immediately
        setMessages((prev) => [...prev, response.data.data])
        lastMessageCount.current = lastMessageCount.current + 1
        setNewMessage("")
        setSelectedImage(null)
        setImagePreview(null)

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Always scroll to bottom after sending
        shouldAutoScroll.current = true
        setTimeout(() => scrollToBottom(), 100)
        setIsNearBottom(true)

        console.log("Message sent successfully")
      } else {
        console.error("Failed to send message:", response.data.message)
        alert(response.data.message || "Không thể gửi tin nhắn")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.")
    } finally {
      setSending(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB")
        return
      }

      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        alert("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)")
        return
      }

      setSelectedImage(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua"
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
  }

  const groupMessagesByDate = () => {
    const groups = {}

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  const messageGroups = groupMessagesByDate()

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }))
  }

  const handleImageError = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }))
  }

  console.log("Current messages state:", messages)
  console.log("Token available:", !!token)

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
        <h3 className="font-bold text-lg">Chat với GreenEats</h3>
        <p className="text-sm text-green-100">Chúng tôi thường phản hồi trong vòng vài phút</p>
        {/* Debug info */}
        <p className="text-xs text-green-200">
          Messages: {messages.length} | Token: {token ? "✓" : "✗"}
        </p>
      </div>

      {/* Messages container */}
      <div
        className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 relative"
        ref={messagesContainerRef}
        style={{ scrollBehavior: "auto" }} // Disable smooth scrolling to prevent conflicts
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin h-8 w-8 text-green-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4 mb-4">
              <Send className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-center">
              {token ? "Bắt đầu cuộc trò chuyện với chúng tôi!" : "Đăng nhập để bắt đầu trò chuyện"}
            </p>
          </div>
        ) : (
          Object.keys(messageGroups).map((date) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                  {formatDate(date)}
                </span>
              </div>

              {messageGroups[date].map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex mb-4 ${message.sender === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                      message.sender === "user"
                        ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    }`}
                  >
                    {message.content && <p className="mb-1 break-words">{message.content}</p>}

                    {message.image && (
                      <div className="relative mt-2">
                        {!loadedImages[message._id] && (
                          <div className="flex justify-center items-center py-4">
                            <Loader className="animate-spin h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <img
                          src={`${url}/uploads/messages/${message.image}`}
                          alt="Attached"
                          className={`max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${!loadedImages[message._id] ? "hidden" : ""}`}
                          onClick={() => window.open(`${url}/uploads/messages/${message.image}`, "_blank")}
                          onLoad={() => handleImageLoad(message._id)}
                          onError={() => handleImageError(message._id)}
                        />
                      </div>
                    )}

                    <div
                      className={`text-xs mt-2 ${
                        message.sender === "user" ? "text-gray-500 dark:text-gray-400" : "text-green-100"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                      {message.sender === "admin" && message.adminName && (
                        <span className="ml-2">• {message.adminName}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Scroll to bottom button with unread count */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
            title="Cuộn xuống tin nhắn mới nhất"
          >
            <ArrowDown size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {imagePreview && (
          <div className="relative mb-3 inline-block">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="h-20 w-auto rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
            />
            <button
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={!token}
            title="Gửi hình ảnh"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            disabled={!token}
          />

          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedImage) || sending || !token}
            className={`p-2 rounded-full transition-all ${
              (!newMessage.trim() && !selectedImage) || sending || !token
                ? "bg-gray-200 text-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
            }`}
            title="Gửi tin nhắn"
          >
            {sending ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatBox
