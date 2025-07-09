"use client"

import { useState, useEffect, useRef } from "react"
import { Send, ImageIcon, Users, MessageCircle, Search, X, MoreVertical, Phone, Video } from "lucide-react"
import axios from "axios"

const Chat = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const url = "http://localhost:4000"
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id)
      const interval = setInterval(() => fetchMessages(selectedUser._id), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${url}/api/message/users`, {
        headers: { token },
      })

      if (response.data.success) {
        setUsers(response.data.data)
      } else {
        console.error("Error fetching users:", response.data.message)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`${url}/api/message/user/${userId}`, {
        headers: { token },
      })

      if (response.data.success) {
        setMessages(response.data.data)
        // Mark messages as read
        await axios.post(
          `${url}/api/message/mark-read`,
          { userId },
          {
            headers: { token },
          },
        )
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if ((!newMessage.trim() && !selectedImage) || sending || !selectedUser) {
      return
    }

    try {
      setSending(true)

      const formData = new FormData()
      formData.append("userId", selectedUser._id)
      formData.append("content", newMessage)

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
        setNewMessage("")
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        alert("Lỗi gửi tin nhắn: " + response.data.message)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Lỗi gửi tin nhắn")
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
        alert("Only image files are allowed")
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
      return date.toLocaleDateString("vi-VN")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Users Sidebar */}
      <div className="w-1/3 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <p className="text-sm text-gray-400">Chat với khách hàng</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-700/50 ${
                  selectedUser?._id === user._id
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                    : "hover:scale-[1.02]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{user.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{user.email}</p>
                      {user.latestMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {user.latestMessage.length > 30
                            ? user.latestMessage.substring(0, 30) + "..."
                            : user.latestMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {user.unreadCount > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-medium shadow-lg">
                        {user.unreadCount > 99 ? "99+" : user.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{formatTime(user.latestMessageTime)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-white text-lg">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-400">{selectedUser.email}</p>
                    <p className="text-xs text-green-400">Đang hoạt động</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200">
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {Object.keys(messageGroups).map((date) => (
                <div key={date}>
                  <div className="flex justify-center my-6">
                    <span className="bg-gray-700/50 backdrop-blur-sm text-gray-300 text-xs px-4 py-2 rounded-full border border-gray-600/30">
                      {formatDate(date)}
                    </span>
                  </div>

                  {messageGroups[date].map((message) => (
                    <div
                      key={message._id}
                      className={`flex mb-6 ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.sender === "admin" ? "flex-row-reverse space-x-reverse" : ""}`}
                      >
                        {message.sender !== "admin" && (
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div
                          className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                            message.sender === "admin"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                              : "bg-gray-700/70 text-white border border-gray-600/30 rounded-bl-md"
                          }`}
                        >
                          {message.content && <p className="mb-1 leading-relaxed">{message.content}</p>}

                          {message.image && (
                            <div className="mt-2">
                              <img
                                src={`${url}/uploads/messages/${message.image}`}
                                alt="Attached"
                                className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity duration-200 shadow-md"
                                onClick={() => window.open(`${url}/uploads/messages/${message.image}`, "_blank")}
                              />
                            </div>
                          )}

                          <div
                            className={`text-xs mt-2 ${message.sender === "admin" ? "text-blue-100" : "text-gray-400"}`}
                          >
                            {formatTime(message.createdAt)}
                            {message.sender === "admin" && <span className="ml-2">• Admin</span>}
                          </div>
                        </div>

                        {message.sender === "admin" && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            A
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 border-t border-gray-700/50">
              {imagePreview && (
                <div className="relative mb-4 inline-block">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-20 w-auto rounded-xl border border-gray-600/50 shadow-lg"
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors duration-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                >
                  <ImageIcon size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImage) || sending}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    (!newMessage.trim() && !selectedImage) || sending
                      ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-900/50 to-gray-800/50">
            <div className="text-center text-gray-400">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Chọn một cuộc trò chuyện</h3>
              <p className="text-gray-500">Chọn một người dùng từ danh sách để bắt đầu chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
