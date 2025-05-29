"use client"

import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import { Package, Clock, CheckCircle, CreditCard, Truck, Wallet, Landmark, Search, Sparkles, Star } from "lucide-react"
import { motion } from "framer-motion"

const MyOrders = () => {
  const { url, token } = useContext(StoreContext)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState([])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } })
      setData(response.data.data)
      setFilteredOrders(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  useEffect(() => {
    // Filter orders based on search term
    if (searchTerm.trim() === "") {
      setFilteredOrders(data)
    } else {
      const filtered = data.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.address.name && order.address.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredOrders(filtered)
    }
  }, [searchTerm, data])

  const getStatusIcon = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return <Clock size={18} className="text-primary" />
      case "Đang giao hàng":
        return <Truck size={18} className="text-blue-400" />
      case "Đã giao":
      case "Đã giao hàng":
        return <CheckCircle size={18} className="text-green-400" />
      default:
        return <Package size={18} className="text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return "bg-primary/20 text-primary border border-primary/30"
      case "Đang giao hàng":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      case "Đã giao":
      case "Đã giao hàng":
        return "bg-green-500/20 text-green-400 border border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "COD":
        return <Truck size={16} className="text-gray-300" />
      case "VNPay":
        return <CreditCard size={16} className="text-blue-400" />
      case "MoMo":
        return <Wallet size={16} className="text-pink-400" />
      case "BankTransfer":
        return <Landmark size={16} className="text-green-400" />
      default:
        return <CreditCard size={16} className="text-gray-400" />
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-500/20 text-green-400 border border-green-500/30"
      case "Đang xử lý":
        return "bg-primary/20 text-primary border border-primary/30"
      case "Thanh toán thất bại":
        return "bg-red-500/20 text-red-400 border border-red-500/30"
      case "Chưa thanh toán":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    }
  }

  // Format date function to handle invalid dates
  const formatDate = (dateString) => {
    if (!dateString) return "Không có ngày"

    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ"
    }

    // Format date to Vietnamese format
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
        >
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <Sparkles className="text-primary mr-3" size={24} />
                <h1 className="text-2xl font-bold text-white">Đơn hàng của tôi</h1>
              </div>

              {/* Search Bar */}
              {data.length > 0 && (
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full rounded-xl border border-slate-600 bg-slate-700/50 py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-400">Đang tải đơn hàng...</p>
              </div>
            ) : data.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Package size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl text-gray-300 mb-2">Bạn chưa có đơn hàng nào</h2>
                <p className="text-gray-400 mb-6">Hãy đặt món ăn đầu tiên của bạn ngay bây giờ</p>
                <button
                  onClick={() => (window.location.href = "/foods")}
                  className="bg-gradient-to-r from-primary to-primary-dark text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
                >
                  Xem thực đơn
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600 overflow-hidden hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Order Header */}
                    <div className="bg-slate-800/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-600">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mr-3">
                          <Package size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">#{order._id.slice(-6)}</p>
                          <p className="text-gray-400 text-xs">{formatDate(order.date)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status || "Đang xử lý"}</span>
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          {order.paymentStatus || "Chưa thanh toán"}
                        </span>
                      </div>
                    </div>

                    {/* Order Content */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Order Items */}
                        <div className="md:col-span-2">
                          <h3 className="text-xs uppercase text-gray-400 mb-3 font-medium flex items-center">
                            <Star className="mr-1" size={12} />
                            Sản phẩm
                          </h3>
                          <div className="space-y-3 max-h-32 overflow-y-auto pr-2 scrollbar-hide">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-slate-600/50 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                                    <img
                                      src={url + "/images/" + item.image || "/placeholder.svg"}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-white truncate max-w-[120px] sm:max-w-[150px]">
                                    {item.name} <span className="text-gray-400">x{item.quantity}</span>
                                  </span>
                                </div>
                                <span className="text-primary font-medium whitespace-nowrap">
                                  {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Info */}
                        <div className="border-t md:border-t-0 md:border-l border-slate-600 pt-4 md:pt-0 md:pl-4">
                          <h3 className="text-xs uppercase text-gray-400 mb-3 font-medium">Thông tin</h3>
                          <div className="space-y-2 text-sm">
                            <p className="flex justify-between">
                              <span className="text-gray-400">Người nhận:</span>
                              <span className="text-white font-medium">{order.address.name}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-400">SĐT:</span>
                              <span className="text-white">{order.address.phone}</span>
                            </p>
                            <p className="flex flex-col">
                              <span className="text-gray-400">Địa chỉ:</span>
                              <span className="text-white text-right text-xs mt-1 break-words">
                                {order.address.street}
                              </span>
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                              <div className="flex items-center">
                                {getPaymentMethodIcon(order.paymentMethod)}
                                <span className="ml-2 text-xs text-gray-400">
                                  {order.paymentMethod === "COD"
                                    ? "COD"
                                    : order.paymentMethod === "VNPay"
                                      ? "VNPay"
                                      : order.paymentMethod === "MoMo"
                                        ? "MoMo"
                                        : "Bank"}
                                </span>
                              </div>
                              <span className="text-lg font-bold text-primary">
                                {order.amount.toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MyOrders
