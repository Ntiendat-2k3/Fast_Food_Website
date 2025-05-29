"use client"

import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import { Package, Clock, CheckCircle, CreditCard, Truck, Wallet, Landmark, Search } from "lucide-react"

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
        return <Clock size={18} className="text-yellow-500" />
      case "Đang giao hàng":
        return <Truck size={18} className="text-blue-500" />
      case "Đã giao":
      case "Đã giao hàng":
        return <CheckCircle size={18} className="text-green-500" />
      default:
        return <Package size={18} className="text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý":
      case "Đang chuẩn bị đồ":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Đang giao hàng":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "Đã giao":
      case "Đã giao hàng":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "COD":
        return <Truck size={16} className="text-gray-600 dark:text-gray-300" />
      case "VNPay":
        return <CreditCard size={16} className="text-blue-500" />
      case "MoMo":
        return <Wallet size={16} className="text-pink-500" />
      case "BankTransfer":
        return <Landmark size={16} className="text-green-500" />
      default:
        return <CreditCard size={16} className="text-gray-500" />
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Thanh toán thất bại":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "Chưa thanh toán":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
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
    <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg overflow-hidden my-20 mx-4 md:mx-auto max-w-6xl transition-colors duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-dark dark:text-white mb-4 md:mb-0">Đơn hàng của tôi</h1>

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
                className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Đang tải đơn hàng...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-500 dark:text-gray-400 mb-4" />
            <h2 className="text-xl text-gray-500 dark:text-gray-400 mb-2">Bạn chưa có đơn hàng nào</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Hãy đặt món ăn đầu tiên của bạn ngay bây giờ</p>
            <button
              onClick={() => (window.location.href = "/foods")}
              className="bg-primary hover:bg-primary-light text-dark py-2 px-6 rounded-lg transition-colors"
            >
              Xem thực đơn
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <div
                key={index}
                className="bg-white dark:bg-dark-light rounded-lg border border-gray-200 dark:border-dark-lighter overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 dark:bg-dark p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-dark-lighter">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <Package size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-dark dark:text-white font-medium text-sm">#{order._id.slice(-6)}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(order.date)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status || "Đang xử lý"}</span>
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
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
                      <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-medium">Sản phẩm</h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2 scrollbar-hide">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-dark rounded overflow-hidden mr-2 flex-shrink-0">
                                <img
                                  src={url + "/images/" + item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-dark dark:text-white truncate max-w-[120px] sm:max-w-[150px]">
                                {item.name} <span className="text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                              </span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="border-t md:border-t-0 md:border-l border-gray-200 dark:border-dark-lighter pt-4 md:pt-0 md:pl-4">
                      <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-medium">Thông tin</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Người nhận:</span>
                          <span className="text-dark dark:text-white font-medium">{order.address.name}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">SĐT:</span>
                          <span className="text-dark dark:text-white">{order.address.phone}</span>
                        </p>
                        <p className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Địa chỉ:</span>
                          <span className="text-dark dark:text-white text-right text-xs mt-1 break-words">
                            {order.address.street}
                          </span>
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center">
                            {getPaymentMethodIcon(order.paymentMethod)}
                            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders
