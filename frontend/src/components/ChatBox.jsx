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
  const [isNearBottom, setIsNearBottom] = useState(true) // Track if user is near bottom
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0) // Track number of unread messages
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (token) {
      fetchMessages()

      const intervalId = setInterval(fetchMessages, 5000)
      return () => clearInterval(intervalId)
    }
  }, [token])

  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const bottom = scrollHeight - scrollTop - clientHeight < 100

    setIsNearBottom(bottom)

    if (bottom) {
      setUnreadCount(0)
      setShowScrollButton(false)
    } else {
      setShowScrollButton(unreadCount > 0)
    }
  }

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [unreadCount])

  const fetchMessages = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await axios.get(`${url}/api/message/user`, {
        headers: { token },
      })

      if (response.data.success) {
        const prevMessageCount = messages.length
        const newMessages = response.data.data

        setMessages(newMessages)

        if (isNearBottom || (prevMessageCount < newMessages.length && !newMessages[newMessages.length - 1]?.isAdmin)) {
          scrollToBottom()
        } else if (prevMessageCount < newMessages.length) {
          const newCount = newMessages.length - prevMessageCount
          setUnreadCount((prev) => prev + newCount)
          setShowScrollButton(true)
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setShowScrollButton(false)
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    if (token && messages.length > 0) {
      scrollToBottom()
    }
  }, [token])

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
      formData.append("content", newMessage)

      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      const response = await axios.post(`${url}/api/message/send`, formData, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        const updatedMessages = [...messages, response.data.data]

        if (response.data.autoResponse) {
          updatedMessages.push(response.data.autoResponse)
        }

        setMessages(updatedMessages)
        setNewMessage("")
        setSelectedImage(null)
        setImagePreview(null)

        setTimeout(scrollToBottom, 100)
        setIsNearBottom(true)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB")
        return
      }

      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        alert("Only image files (JPEG, PNG, GIF, WEBP) are allowed")
        return
      }

      setSelectedImage(file)

      // Create preview
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
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const groupMessagesByDate = () => {
    const groups = {}

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString()
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

  return (
    <div className="flex flex-col h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Chat header */}
      <div className="bg-gray-100 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="font-bold text-gray-800 dark:text-white">Chat với GreenEats</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Chúng tôi thường phản hồi trong vòng vài phút</p>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 relative" ref={messagesContainerRef}>
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 mb-4">
              <Send className="h-8 w-8" />
            </div>
            <p className="text-center">
              {token ? "Bắt đầu cuộc trò chuyện với chúng tôi!" : "Đăng nhập để bắt đầu trò chuyện"}
            </p>
          </div>
        ) : (
          Object.keys(messageGroups).map((date) => (
            <div key={date}>
              <div className="flex justify-center my-3">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                  {formatDate(date)}
                </span>
              </div>

              {messageGroups[date].map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex mb-4 ${message.isAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isAdmin
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none"
                        : "bg-primary text-dark rounded-tr-none"
                    }`}
                  >
                    {message.content && <p className="mb-1">{message.content}</p>}

                    {message.image && (
                      <div className="relative mt-2">
                        {!loadedImages[message._id] && (
                          <div className="flex justify-center items-center py-4">
                            <Loader className="animate-spin h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <img
                          src={`${url}/images/${message.image}`}
                          alt="Attached"
                          className={`max-w-full rounded-md cursor-pointer hover:opacity-90 transition-opacity ${!loadedImages[message._id] ? "hidden" : ""}`}
                          onClick={() => window.open(`${url}/images/${message.image}`, "_blank")}
                          onLoad={() => handleImageLoad(message._id)}
                          onError={() => handleImageError(message._id)}
                        />
                      </div>
                    )}

                    <div
                      className={`text-xs mt-1 ${message.isAdmin ? "text-gray-500 dark:text-gray-400" : "text-gray-700"}`}
                    >
                      {formatTime(message.createdAt)}
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
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-primary text-dark p-2 rounded-full shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center"
            title="Cuộn xuống tin nhắn mới nhất"
          >
            <ArrowDown size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        {imagePreview && (
          <div className="relative mb-2 inline-block">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="h-20 w-auto rounded-md border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            disabled={!token}
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
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 mx-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            disabled={!token}
          />

          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedImage) || sending || !token}
            className={`p-2 rounded-full ${
              (!newMessage.trim() && !selectedImage) || sending || !token
                ? "bg-gray-200 text-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-primary text-dark hover:bg-primary-dark"
            }`}
          >
            {sending ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatBox
