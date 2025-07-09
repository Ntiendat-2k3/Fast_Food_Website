"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Search, Send, ImageIcon, X, Loader, MessageCircle, Phone, Video, MoreHorizontal } from "lucide-react"

const Chat = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const url = "http://localhost:4000"
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 5000)
    return () => clearInterval(interval)
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}/api/message/users`, {
        headers: { token },
      })
      if (response.data.success) {
        setUsers(response.data.data)
        console.log("Fetched users:", response.data.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      setLoading(true)
      const response = await axios.get(`${url}/api/message/user/${userId}`, {
        headers: { token },
      })
      if (response.data.success) {
        setMessages(response.data.data)
        console.log(`Fetched ${response.data.data.length} messages for user ${userId}`)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
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

      console.log("Sending admin message:", {
        userId: selectedUser._id,
        content: newMessage,
        hasImage: !!selectedImage,
      })

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
        console.log("Admin message sent successfully")
      } else {
        console.error("Failed to send admin message:", response.data.message)
        alert(response.data.message)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Không thể gửi tin nhắn")
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
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const messageGroups = groupMessagesByDate()

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Users Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-4">Tin nhắn</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có tin nhắn nào</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                  selectedUser?._id === user._id ? "bg-gray-700" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white truncate">{user.name}</h3>
                      {user.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user.latestMessage}</p>
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
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : (
                Object.keys(messageGroups).map((date) => (
                  <div key={date}>
                    <div className="flex justify-center my-4">
                      <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                        {formatDate(date)}
                      </span>
                    </div>
                    {messageGroups[date].map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`flex mb-4 ${message.sender === "user" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 ${
                            message.sender === "user"
                              ? "bg-gray-700 text-white"
                              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          }`}
                        >
                          {message.content && <p className="break-words">{message.content}</p>}
                          {message.image && (
                            <div className="mt-2">
                              <img
                                src={`${url}/uploads/messages/${message.image}`}
                                alt="Attached"
                                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(`${url}/uploads/messages/${message.image}`, "_blank")}
                              />
                            </div>
                          )}
                          <div className="text-xs mt-2 opacity-70">
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
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              {imagePreview && (
                <div className="relative mb-3 inline-block">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-20 w-auto rounded-lg border border-gray-600"
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
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
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImage) || sending}
                  className={`p-2 rounded-lg transition-colors ${
                    (!newMessage.trim() && !selectedImage) || sending
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                  }`}
                >
                  {sending ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Chọn một cuộc trò chuyện</h3>
              <p>Chọn người dùng từ danh sách bên trái để bắt đầu trò chuyện</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
