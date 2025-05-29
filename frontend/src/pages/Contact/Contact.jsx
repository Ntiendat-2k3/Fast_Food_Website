"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Phone, Mail, Clock, Send, ImageIcon, MessageCircle, Sparkles } from "lucide-react"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import { motion } from "framer-motion"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="text-yellow-400 mr-3" size={32} />
            <h1 className="text-4xl font-bold text-white">Liên Hệ Với Chúng Tôi</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700"
          >
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
              <Phone className="mr-3 text-yellow-400" size={24} />
              Thông Tin Liên Hệ
            </h2>

            <div className="space-y-6">
              <div className="flex items-start group">
                <div className="p-3 bg-yellow-400/20 rounded-xl mr-4 group-hover:bg-yellow-400/30 transition-colors">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Địa Chỉ</h3>
                  <p className="text-gray-300">123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="p-3 bg-yellow-400/20 rounded-xl mr-4 group-hover:bg-yellow-400/30 transition-colors">
                  <Phone className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Điện Thoại</h3>
                  <p className="text-gray-300">+84 123 456 789</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="p-3 bg-yellow-400/20 rounded-xl mr-4 group-hover:bg-yellow-400/30 transition-colors">
                  <Mail className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Email</h3>
                  <p className="text-gray-300">info@greeneats.com</p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="p-3 bg-yellow-400/20 rounded-xl mr-4 group-hover:bg-yellow-400/30 transition-colors">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">Giờ Mở Cửa</h3>
                  <p className="text-gray-300">Thứ 2 - Chủ Nhật: 8:00 - 22:00</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-white">Bản Đồ</h3>
              <div className="w-full h-48 sm:h-64 bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0381286064193!2d106.69908937469275!3d10.7287758896639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f7b7ed82f1d%3A0xd0c5bbf53a4b9502!2zMTIzIMSQxrDhu51uZyBOZ3V54buFbiBWxINuIExpbmgsIFTDom4gUGjDuSwgUXXhuq1uIDcsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1715512027!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </motion.div>

          {/* Chat Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] border border-slate-700"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 p-4">
              <div className="flex items-center">
                <MessageCircle className="mr-3" size={24} />
                <div>
                  <h2 className="text-xl font-semibold">Chat Với Chúng Tôi</h2>
                  <p className="text-sm opacity-90">Chúng tôi sẽ phản hồi trong thời gian sớm nhất</p>
                </div>
              </div>
            </div>

            {user ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto scrollbar-hide" ref={messagesContainerRef}>
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Bắt đầu cuộc trò chuyện với chúng tôi</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <motion.div
                        key={msg._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-4 flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-xl ${
                            msg.isAdmin
                              ? "bg-slate-700/50 text-gray-200 border border-slate-600"
                              : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900"
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
                          <div className={`text-xs mt-1 ${msg.isAdmin ? "text-gray-400" : "text-slate-700"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-700">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 border border-slate-600 rounded-l-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-slate-700/50 text-white placeholder-gray-400"
                      placeholder="Nhập tin nhắn..."
                      disabled={loading}
                    />
                    <label className="bg-slate-700/50 border-t border-b border-slate-600 px-3 py-3 cursor-pointer hover:bg-slate-600/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={loading}
                      />
                      <ImageIcon size={20} className="text-gray-400" />
                    </label>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 px-4 py-3 rounded-r-xl transition-all duration-300 disabled:opacity-50"
                      disabled={loading}
                    >
                      <Send size={20} />
                    </button>
                  </form>
                  {selectedImage && (
                    <div className="mt-2 text-sm text-gray-400 truncate">Đã chọn: {selectedImage.name}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageCircle size={64} className="mx-auto mb-4 text-gray-500" />
                  <p className="mb-4 text-gray-300">Vui lòng đăng nhập để chat với chúng tôi</p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                  >
                    Đăng Nhập
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact
