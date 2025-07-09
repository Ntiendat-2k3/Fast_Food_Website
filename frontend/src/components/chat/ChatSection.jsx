"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import ChatHeader from "./ChatHeader"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import LoginPrompt from "./LoginPrompt"

const ChatSection = ({ user, onLoginClick }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const baseUrl = "http://localhost:4000"

  useEffect(() => {
    if (!user) return

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/message/my-messages`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.data.success) {
          setMessages(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()

    // Poll for new messages every 3 seconds
    const intervalId = setInterval(fetchMessages, 3000)
    return () => clearInterval(intervalId)
  }, [user])

  const handleImageUpload = (e) => {
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
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedImage) || !user) {
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("content", newMessage)

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
        setMessages([...messages, response.data.data])
        setNewMessage("")
        setSelectedImage(null)
      } else {
        alert(response.data.message || "Không thể gửi tin nhắn")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Không thể gửi tin nhắn")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] border border-yellow-500/20 relative"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full blur-sm opacity-60"></div>

      <ChatHeader />

      {user ? (
        <>
          <ChatMessages messages={messages} baseUrl={baseUrl} />
          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            handleSendMessage={handleSendMessage}
            handleImageUpload={handleImageUpload}
            loading={loading}
          />
        </>
      ) : (
        <LoginPrompt onLoginClick={onLoginClick} />
      )}

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
    </motion.div>
  )
}

export default ChatSection
