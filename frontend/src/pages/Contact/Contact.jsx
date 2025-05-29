"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Phone, Mail, Clock, Send, ImageIcon } from "lucide-react"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"

const Contact = () => {
  const { user } = useContext(StoreContext)
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const messagesContainerRef = useRef(null)
  const baseUrl = "http://localhost:4000" // Match the port in server.js

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/message/user`, {
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

    // Poll for new messages every 5 seconds
    const intervalId = setInterval(fetchMessages, 5000)

    return () => clearInterval(intervalId)
  }, [user])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
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
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto mt-10 py-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Liên Hệ Với Chúng Tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 dark:bg-dark-lighter">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">Thông Tin Liên Hệ</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Địa Chỉ</h3>
                <p className="text-gray-600 dark:text-gray-400">123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Điện Thoại</h3>
                <p className="text-gray-600 dark:text-gray-400">+84 123 456 789</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">info@greeneats.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-5 h-5 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Giờ Mở Cửa</h3>
                <p className="text-gray-600 dark:text-gray-400">Thứ 2 - Chủ Nhật: 8:00 - 22:00</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Bản Đồ</h3>
            <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0381286064193!2d106.69908937469275!3d10.7287758896639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f7b7ed82f1d%3A0xd0c5bbf53a4b9502!2zMTIzIMSQxrDhu51uZyBOZ3V54buFbiBWxINuIExpbmgsIFTDom4gUGjDuiwgUXXhuq1uIDcsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1715512027!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[500px] sm:h-[600px] dark:bg-dark-lighter">
          <div className="bg-yellow-500 text-white p-4">
            <h2 className="text-xl font-semibold">Chat Với Chúng Tôi</h2>
            <p className="text-sm">Chúng tôi sẽ phản hồi trong thời gian sớm nhất</p>
          </div>

          {user ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto scrollbar-hide" ref={messagesContainerRef}>
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>Bắt đầu cuộc trò chuyện với chúng tôi</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`mb-4 flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-lg ${
                          msg.isAdmin ? "bg-gray-200 text-gray-800" : "bg-yellow-500 text-white"
                        }`}
                      >
                        {msg.image && (
                          <img
                            src={`${baseUrl}/images/${msg.image}`}
                            alt="Message attachment"
                            className="mb-2 rounded-md max-w-full"
                            style={{ maxHeight: "200px" }}
                          />
                        )}
                        <p className="break-words">{msg.content}</p>
                        <div className={`text-xs mt-1 ${msg.isAdmin ? "text-gray-500" : "text-yellow-100"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Nhập tin nhắn..."
                    disabled={loading}
                  />
                  <label className="bg-gray-200 px-3 py-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <ImageIcon size={20} className="text-gray-600" />
                  </label>
                  <button
                    type="submit"
                    className="bg-yellow-500 text-white px-4 py-2 rounded-r-lg hover:bg-yellow-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    <Send size={20} />
                  </button>
                </form>
                {selectedImage && (
                  <div className="mt-2 text-sm text-gray-600 truncate">Đã chọn: {selectedImage.name}</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <p className="mb-4 text-gray-600">Vui lòng đăng nhập để chat với chúng tôi</p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  Đăng Nhập
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact
