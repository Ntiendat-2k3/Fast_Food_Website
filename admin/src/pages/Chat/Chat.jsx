"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import UserList from "../../components/chat/UserList"
import ChatHeader from "../../components/chat/ChatHeader"
import MessageList from "../../components/chat/MessageList"
import MessageInput from "../../components/chat/MessageInput"
import ImageGallery from "../../components/chat/ImageGallery"

const Chat = () => {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showGallery, setShowGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [loadedImages, setLoadedImages] = useState({}) // Track loaded images
  const [isNearBottom, setIsNearBottom] = useState(true) // Track if user is near bottom
  const [showScrollButton, setShowScrollButton] = useState(false) // Show scroll to bottom button
  const [unreadCount, setUnreadCount] = useState(0) // Track number of unread messages
  const messagesContainerRef = useRef(null)
  const baseUrl = "http://localhost:4000" // Match the port in server.js

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/message/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.data.success) {
          setUsers(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()

    // Poll for new users every 10 seconds
    const intervalId = setInterval(fetchUsers, 10000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!selectedUser) return

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/message/conversation/${selectedUser._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.data.success) {
          // Store previous message count to determine if new messages arrived
          const prevMessageCount = messages.length
          const newMessages = response.data.data

          setMessages(newMessages)

          // Only auto-scroll if user is already near bottom or if this is a new message sent by admin
          if (isNearBottom || (prevMessageCount < newMessages.length && newMessages[newMessages.length - 1]?.isAdmin)) {
            scrollToBottom()
          } else if (prevMessageCount < newMessages.length) {
            // New message arrived but user has scrolled up
            const newCount = newMessages.length - prevMessageCount
            setUnreadCount((prev) => prev + newCount)
            setShowScrollButton(true)
          }

          // Extract images from messages for the gallery
          const images = response.data.data
            .filter((msg) => msg.image)
            .map((msg) => ({
              id: msg._id,
              url: `${baseUrl}/images/${msg.image}`,
              filename: msg.image,
            }))

          setGalleryImages(images)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()

    // Poll for new messages every 3 seconds
    const intervalId = setInterval(fetchMessages, 3000)

    return () => clearInterval(intervalId)
  }, [selectedUser, isNearBottom, messages.length])

  // Handle scroll events to determine if user is near bottom
  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    // Consider "near bottom" if within 100px of the bottom
    const bottom = scrollHeight - scrollTop - clientHeight < 100

    setIsNearBottom(bottom)

    if (bottom) {
      // Reset unread count when scrolled to bottom
      setUnreadCount(0)
      setShowScrollButton(false)
    } else {
      setShowScrollButton(unreadCount > 0)
    }
  }

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [unreadCount])

  // Initial scroll to bottom when selecting a user or when component mounts
  useEffect(() => {
    if (selectedUser) {
      scrollToBottom()
      setUnreadCount(0) // Reset unread count when changing users
    }
  }, [selectedUser])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setShowScrollButton(false)
      setUnreadCount(0) // Reset unread count when scrolling to bottom
    }
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setShowGallery(false)
    setIsNearBottom(true) // Reset scroll position when changing users
    setUnreadCount(0) // Reset unread count when changing users
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB")
        return
      }

      // Validate file type
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

  const handleGalleryImageSelect = (imageUrl) => {
    // Extract the filename from the URL
    const filename = imageUrl.split("/").pop()

    // Set the preview directly without fetching
    setImagePreview(imageUrl)
    setShowGallery(false)

    // Create a file object from the URL
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], filename, { type: blob.type })
        setSelectedImage(file)
      })
      .catch((err) => console.error("Error selecting gallery image:", err))
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedImage) || !selectedUser) {
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("content", newMessage)
      formData.append("userId", selectedUser._id) // Add the recipient's userId

      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      const response = await axios.post(`${baseUrl}/api/message/send`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.data.success) {
        // Add isAdmin: true to the message
        const adminMessage = { ...response.data.data, isAdmin: true }
        setMessages([...messages, adminMessage])
        setNewMessage("")
        setSelectedImage(null)
        setImagePreview(null)

        // Always scroll to bottom after sending a message
        setTimeout(scrollToBottom, 100)
        setIsNearBottom(true)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => user.userName.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle image load event
  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }))
  }

  // Handle image error event
  const handleImageError = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true })) // Mark as loaded to remove spinner
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Quản Lý Chat</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-150px)]">
          {/* User List */}
          <UserList
            users={users}
            selectedUser={selectedUser}
            onSelectUser={handleUserSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Chat Area */}
          <div className="bg-gray-900 rounded-lg overflow-hidden col-span-3 flex flex-col">
            {selectedUser ? (
              <>
                <ChatHeader user={selectedUser} onToggleGallery={() => setShowGallery(!showGallery)} />

                <MessageList
                  messages={messages}
                  loadedImages={loadedImages}
                  onImageLoad={handleImageLoad}
                  onImageError={handleImageError}
                  baseUrl={baseUrl}
                  isNearBottom={isNearBottom}
                  showScrollButton={showScrollButton}
                  unreadCount={unreadCount}
                  onScroll={handleScroll}
                  scrollToBottom={scrollToBottom}
                  messagesContainerRef={messagesContainerRef}
                />

                <MessageInput
                  newMessage={newMessage}
                  onMessageChange={setNewMessage}
                  onSendMessage={handleSendMessage}
                  onImageUpload={handleImageUpload}
                  imagePreview={imagePreview}
                  onClearImage={clearSelectedImage}
                  loading={loading}
                />

                <ImageGallery
                  isOpen={showGallery}
                  onClose={() => setShowGallery(false)}
                  images={galleryImages}
                  onSelectImage={handleGalleryImageSelect}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p>Chọn một người dùng để bắt đầu trò chuyện</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
