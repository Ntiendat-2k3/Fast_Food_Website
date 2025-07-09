"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { MessageCircle, Search, Phone, Video, Info, ImageIcon, Send, X, Trash2 } from "lucide-react"

const Chat = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [usersLoading, setUsersLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showGallery, setShowGallery] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Scroll management refs
  const userScrolling = useRef(false)
  const scrollTimeout = useRef(null)
  const lastMessageCount = useRef(0)
  const shouldAutoScroll = useRef(true)
  const programmaticScroll = useRef(false)

  const url = "http://localhost:4000"
  const token = localStorage.getItem("token")

  // Fetch users with messages
  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await axios.get(`${url}/api/message/users`, {
        headers: { token },
      })
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Check if user is at bottom of scroll
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    return scrollHeight - scrollTop - clientHeight < 50
  }

  // Fetch messages for selected user
  const fetchMessages = async (userId, isPolling = false) => {
    try {
      if (!isPolling) {
        setMessagesLoading(true)
      }

      const response = await axios.get(`${url}/api/message/user/${userId}`, {
        headers: { token },
      })

      if (response.data.success) {
        const newMessages = response.data.data
        const wasAtBottom = isAtBottom()

        // Only update if there are actually new messages or it's not polling
        if (!isPolling || newMessages.length !== lastMessageCount.current) {
          setMessages(newMessages)
          lastMessageCount.current = newMessages.length

          // Only auto-scroll if:
          // 1. User was at bottom AND not manually scrolling
          // 2. OR it's the first load (not polling)
          if ((wasAtBottom && !userScrolling.current && shouldAutoScroll.current) || !isPolling) {
            setTimeout(() => {
              scrollToBottom()
            }, 100)
          }
        }

        // Mark messages as read
        await markMessagesAsRead(userId)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      if (!isPolling) {
        setMessagesLoading(false)
      }
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (userId) => {
    try {
      await axios.post(`${url}/api/message/mark-read`, { userId }, { headers: { token } })
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, unreadCount: 0 } : user)))
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedUser || sending) return

    try {
      setSending(true)
      const formData = new FormData()
      formData.append("userId", selectedUser._id)

      if (newMessage.trim()) {
        formData.append("content", newMessage.trim())
      }

      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      const response = await axios.post(`${url}/api/message/admin-send`, formData, {
        headers: {
          token,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data])
        lastMessageCount.current = lastMessageCount.current + 1
        setNewMessage("")
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUser._id
              ? {
                  ...user,
                  unreadCount: 0,
                  latestMessage: response.data.data.content,
                  latestMessageTime: response.data.data.createdAt,
                }
              : user,
          ),
        )

        setSelectedUser((prev) => ({
          ...prev,
          unreadCount: 0,
        }))

        // Always scroll to bottom when sending message
        shouldAutoScroll.current = true
        setTimeout(() => {
          scrollToBottom()
        }, 100)

        fetchUsers()
      } else {
        alert(response.data.message || "Không thể gửi tin nhắn")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Không thể gửi tin nhắn")
    } finally {
      setSending(false)
    }
  }

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) return

    try {
      const response = await axios.delete(`${url}/api/message/${messageId}`, {
        headers: { token },
      })

      if (response.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
        lastMessageCount.current = lastMessageCount.current - 1
      } else {
        alert(response.data.message || "Không thể xóa tin nhắn")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Không thể xóa tin nhắn")
    }
  }

  // Handle image upload
  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh")
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setSelectedImage(null)
      setImagePreview(null)
    }
  }

  // Handle key press in message input
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle user selection
  const handleUserSelect = async (user) => {
    setSelectedUser(user)
    setMessages([])
    setShowGallery(false)
    lastMessageCount.current = 0
    shouldAutoScroll.current = true
    userScrolling.current = false

    if (user.unreadCount > 0) {
      await markMessagesAsRead(user._id)
    }
  }

  // Toggle image gallery
  const handleToggleGallery = () => {
    setShowGallery(!showGallery)
  }

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current && !userScrolling.current) {
      programmaticScroll.current = true
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setTimeout(() => {
        programmaticScroll.current = false
      }, 200)
    }
  }

  // Handle scroll events with debouncing
  const handleScroll = () => {
    if (!messagesContainerRef.current || programmaticScroll.current) return

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    // Mark as user scrolling immediately
    userScrolling.current = true

    // Check if user is at bottom
    const atBottom = isAtBottom()
    shouldAutoScroll.current = atBottom

    // Reset user scrolling flag after they stop scrolling
    scrollTimeout.current = setTimeout(() => {
      userScrolling.current = false
    }, 1500) // Longer timeout to prevent interference
  }

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get image messages for gallery
  const imageMessages = messages.filter((msg) => msg.type === "image")

  // Effects
  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id, false) // Initial load
      const interval = setInterval(() => {
        // Only poll if user is not actively scrolling
        if (!userScrolling.current) {
          fetchMessages(selectedUser._id, true) // Polling
        }
      }, 5000) // Reduced frequency
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  // Cleanup scroll timeout
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 gap-6">
      {/* Users Sidebar */}
      <div className="w-96 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-yellow-500/20 rounded-2xl shadow-2xl shadow-yellow-500/10 flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-yellow-500/20 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <MessageCircle className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Tin nhắn khách hàng
              </h2>
              <p className="text-slate-400 text-sm">Quản lý hỗ trợ khách hàng</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-yellow-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500/30 scrollbar-track-slate-800/50">
          {usersLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Đang tải danh sách...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Chưa có tin nhắn</h3>
                <p className="text-slate-400">Tin nhắn từ khách hàng sẽ xuất hiện ở đây</p>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 m-2 rounded-xl cursor-pointer transition-all duration-300 hover:bg-slate-700/50 hover:shadow-lg hover:shadow-yellow-500/10 ${
                    selectedUser?._id === user._id
                      ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/40 shadow-lg shadow-yellow-500/20"
                      : "bg-slate-800/30 border border-slate-700/50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {user.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                          {user.unreadCount > 9 ? "9+" : user.unreadCount}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full shadow-lg"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white truncate">{user.name || "Khách hàng"}</h4>
                        <span className="text-xs text-yellow-400 font-medium">
                          {user.latestMessageTime
                            ? new Date(user.latestMessageTime).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 truncate mb-1">{user.email}</p>

                      {user.latestMessage && (
                        <p className="text-sm text-slate-300 truncate">
                          {user.latestMessage.length > 35
                            ? user.latestMessage.substring(0, 35) + "..."
                            : user.latestMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-yellow-500/20 rounded-2xl shadow-2xl shadow-yellow-500/10 overflow-hidden">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-yellow-500/20 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                      {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full shadow-lg animate-pulse"></div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedUser.name || "Khách hàng"}</h3>
                    <p className="text-yellow-400 text-sm font-medium">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleGallery}
                    className="p-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20"
                    title="Thư viện ảnh"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all duration-300">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all duration-300">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-800/50 scrollbar-thin scrollbar-thumb-yellow-500/30 scrollbar-track-slate-800/50"
              style={{ scrollBehavior: "auto" }} // Disable smooth scrolling to prevent conflicts
            >
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Đang tải tin nhắn...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Bắt đầu cuộc trò chuyện</h3>
                    <p className="text-slate-400">Gửi tin nhắn đầu tiên để bắt đầu hỗ trợ khách hàng</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"} mb-4 group`}
                  >
                    <div className={`max-w-md relative`}>
                      <div
                        className={`px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 ${
                          message.sender === "admin"
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-br-md shadow-yellow-500/30"
                            : "bg-gradient-to-r from-slate-700 to-slate-600 text-white border border-yellow-500/20 rounded-bl-md shadow-slate-900/50"
                        }`}
                      >
                        {message.type === "image" ? (
                          <div className="space-y-3">
                            <img
                              src={`${url}/uploads/messages/${message.image}`}
                              alt="Hình ảnh"
                              className="max-w-full h-auto rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
                              onClick={() => window.open(`${url}/uploads/messages/${message.image}`, "_blank")}
                            />
                            <div className="flex items-center space-x-3 text-sm">
                              <button
                                onClick={() => window.open(`${url}/uploads/messages/${message.image}`, "_blank")}
                                className="flex items-center space-x-1 hover:underline opacity-75 hover:opacity-100 transition-opacity"
                              >
                                <Info className="w-4 h-4" />
                                <span>Xem</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                          <span className="text-xs opacity-75 font-medium">
                            {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.sender === "admin" && (
                            <button
                              onClick={() => deleteMessage(message._id)}
                              className="ml-3 p-1 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Xóa tin nhắn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-yellow-500/20 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-24 rounded-xl border-2 border-yellow-500/30 shadow-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-4">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                <button
                  onClick={handleImageUpload}
                  disabled={sending}
                  className="p-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-yellow-500/20"
                  title="Gửi hình ảnh"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>

                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn hỗ trợ..."
                    className="w-full px-6 py-4 bg-slate-700/50 border border-yellow-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 resize-none transition-all duration-300"
                    rows="1"
                    style={{ minHeight: "56px", maxHeight: "120px" }}
                    disabled={sending}
                    onInput={(e) => {
                      e.target.style.height = "auto"
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                    }}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !imagePreview) || sending}
                  className={`p-4 rounded-xl transition-all duration-300 shadow-lg ${
                    (!newMessage.trim() && !imagePreview) || sending
                      ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 hover:shadow-yellow-500/30 hover:scale-105"
                  }`}
                  title="Gửi tin nhắn"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-current"></div>
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Chọn cuộc trò chuyện</h3>
              <p className="text-slate-400 text-lg">Chọn khách hàng từ danh sách bên trái để bắt đầu hỗ trợ</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-500/30 rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl shadow-yellow-500/20">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Thư viện hình ảnh</h3>
            <p className="text-slate-400 mb-6">
              {imageMessages.length > 0
                ? `Có ${imageMessages.length} hình ảnh trong cuộc trò chuyện này`
                : "Chưa có hình ảnh nào được chia sẻ"}
            </p>
            <button
              onClick={() => setShowGallery(false)}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
