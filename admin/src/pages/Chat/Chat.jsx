"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { MessageCircle, ImageIcon } from "lucide-react"

// Import components
import ChatHeader from "../../components/chat/ChatHeader"
import UserList from "../../components/chat/UserList"
import MessageList from "../../components/chat/MessageList"
import MessageInput from "../../components/chat/MessageInput"
import ImageGallery from "../../components/chat/ImageGallery"

const Chat = () => {
  const url = "http://localhost:4000"
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch users who have sent messages
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại")
        return
      }

      console.log("Fetching message users...")

      const response = await axios.get(`${url}/api/message/users`, {
        headers: {
          token: token,
        },
      })

      console.log("Users response:", response.data)

      if (response.data.success) {
        setUsers(response.data.data)
        console.log(`Loaded ${response.data.data.length} users`)
      } else {
        console.error("Failed to fetch users:", response.data.message)
        toast.error(response.data.message || "Lỗi khi tải danh sách người dùng")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Lỗi kết nối khi tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for selected user
  const fetchMessages = async (userId) => {
    if (!userId) return

    setMessagesLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại")
        return
      }

      console.log("Fetching messages for user:", userId)

      const response = await axios.get(`${url}/api/message/user/${userId}`, {
        headers: {
          token: token,
        },
      })

      console.log("Messages response:", response.data)

      if (response.data.success) {
        setMessages(response.data.data)
        console.log(`Loaded ${response.data.data.length} messages`)

        // Mark messages as read
        await markAsRead(userId)
      } else {
        console.error("Failed to fetch messages:", response.data.message)
        toast.error(response.data.message || "Lỗi khi tải tin nhắn")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Lỗi kết nối khi tải tin nhắn")
    } finally {
      setMessagesLoading(false)
    }
  }

  // Mark messages as read
  const markAsRead = async (userId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await axios.post(
        `${url}/api/message/mark-read`,
        { userId },
        {
          headers: {
            token: token,
          },
        },
      )

      // Update user's unread count
      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, unreadCount: 0 } : user)))
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return

    setSending(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại")
        return
      }

      console.log("Sending message:", { userId: selectedUser._id, message: newMessage })

      const response = await axios.post(
        `${url}/api/message/admin-send`,
        {
          userId: selectedUser._id,
          message: newMessage,
          type: "text",
        },
        {
          headers: {
            token: token,
          },
        },
      )

      console.log("Send message response:", response.data)

      if (response.data.success) {
        setNewMessage("")
        setImagePreview(null)

        // Add message to current messages
        setMessages((prev) => [...prev, response.data.data])

        // Update user's latest message
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUser._id
              ? {
                  ...user,
                  latestMessage: newMessage,
                  latestMessageTime: new Date(),
                }
              : user,
          ),
        )

        toast.success("Đã gửi tin nhắn")
      } else {
        console.error("Failed to send message:", response.data.message)
        toast.error(response.data.message || "Lỗi khi gửi tin nhắn")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Lỗi kết nối khi gửi tin nhắn")
    } finally {
      setSending(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file || !selectedUser) return

    setSending(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại")
        return
      }

      // Upload image first
      const formData = new FormData()
      formData.append("image", file)

      const uploadResponse = await axios.post(`${url}/api/message/upload-image`, formData, {
        headers: {
          token: token,
          "Content-Type": "multipart/form-data",
        },
      })

      if (uploadResponse.data.success) {
        // Send image message
        const response = await axios.post(
          `${url}/api/message/admin-send`,
          {
            userId: selectedUser._id,
            message: uploadResponse.data.imageUrl,
            type: "image",
          },
          {
            headers: {
              token: token,
            },
          },
        )

        if (response.data.success) {
          setMessages((prev) => [...prev, response.data.data])
          setImagePreview(null)
          toast.success("Đã gửi hình ảnh")
        } else {
          toast.error("Lỗi khi gửi hình ảnh")
        }
      } else {
        toast.error("Lỗi khi upload hình ảnh")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Lỗi khi upload hình ảnh")
    } finally {
      setSending(false)
    }
  }

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại")
        return
      }

      const response = await axios.post(
        `${url}/api/message/delete`,
        { messageId },
        {
          headers: {
            token: token,
          },
        },
      )

      if (response.data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
        toast.success("Đã xóa tin nhắn")
      } else {
        toast.error("Lỗi khi xóa tin nhắn")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      toast.error("Lỗi khi xóa tin nhắn")
    }
  }

  // Handle user selection
  const handleUserSelect = (user) => {
    console.log("Selected user:", user)
    setSelectedUser(user)
    fetchMessages(user._id)
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target.result)
        }
        reader.readAsDataURL(file)
        handleImageUpload(file)
      } else {
        toast.error("Chỉ chấp nhận file hình ảnh")
      }
    }
  }

  // Auto-refresh users every 30 seconds
  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  // Auto-refresh messages every 10 seconds
  useEffect(() => {
    if (selectedUser) {
      const interval = setInterval(() => {
        fetchMessages(selectedUser._id)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full flex">
        {/* Users Sidebar */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <ChatHeader title="Tin nhắn khách hàng" icon={MessageCircle} />

          <UserList users={users} selectedUser={selectedUser} onUserSelect={handleUserSelect} loading={loading} />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowImageGallery(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <MessageList
                messages={messages}
                messagesLoading={messagesLoading}
                onDeleteMessage={deleteMessage}
                messagesEndRef={messagesEndRef}
              />

              {/* Message Input */}
              <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={sendMessage}
                onKeyPress={handleKeyPress}
                sending={sending}
                imagePreview={imagePreview}
                onImageUpload={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chọn một cuộc trò chuyện</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Chọn một người dùng từ danh sách để bắt đầu trò chuyện
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <ImageGallery
          messages={messages.filter((msg) => msg.type === "image")}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  )
}

export default Chat
