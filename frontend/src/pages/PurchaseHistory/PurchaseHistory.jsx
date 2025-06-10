"use client"

import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import {
  Package,
  Clock,
  CheckCircle,
  CreditCard,
  Truck,
  Wallet,
  Landmark,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  ShoppingCart,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const PurchaseHistory = () => {
  const { url, token, user } = useContext(StoreContext)
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState([])
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    totalItems: 0,
  })
  const [timeFilter, setTimeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/")
      toast.error("Vui lòng đăng nhập để xem lịch sử mua hàng")
    }
  }, [token, navigate])

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true)

      if (!user || !user._id) {
        console.error("User ID not available")
        setLoading(false)
        return
      }

      console.log("Fetching purchase history for user:", user._id)

      const response = await axios.post(
        `${url}/api/purchase-history/user`,
        { userId: user._id },
        {
          headers: { token },
          params: {
            page: currentPage,
            limit: 10,
            sortBy: sortBy,
            search: searchTerm,
            timeRange: timeFilter,
          },
        },
      )

      console.log("Purchase history response:", response.data)

      if (response.data.success) {
        const purchases = response.data.data || []
        setData(purchases)
        setFilteredOrders(purchases)
        setTotalPages(response.data.pagination?.totalPages || 1)

        // Set stats from response
        const statsData = response.data.stats || {}
        setStats({
          totalSpent: statsData.totalSpent || 0,
          totalOrders: statsData.totalOrders || 0,
          totalItems: statsData.totalItems || 0,
        })

        console.log("Loaded purchases:", purchases.length)
        console.log("Stats:", statsData)
      } else {
        console.error("API Error:", response.data.message)
        toast.error(response.data.message || "Không thể tải lịch sử mua hàng")
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching purchase history:", error)
      toast.error("Lỗi khi tải lịch sử mua hàng")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && user) {
      fetchPurchaseHistory()
    }
  }, [token, user, currentPage, sortBy, timeFilter])

  useEffect(() => {
    // Filter orders based on search term
    if (searchTerm.trim() === "") {
      setFilteredOrders(data)
    } else {
      const filtered = data.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.deliveryAddress?.name &&
            order.deliveryAddress.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    fetchPurchaseHistory()
  }

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1)
    setIsFilterOpen(false)
    fetchPurchaseHistory()
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  // Handle buy again
  const handleBuyAgain = (items) => {
    toast.info("Tính năng mua lại đang được phát triển")
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
                <div>
                  <h1 className="text-2xl font-bold text-white">Lịch sử mua hàng</h1>
                  <p className="text-gray-400 text-sm mt-1">Xem lại các đơn hàng đã hoàn thành</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <form onSubmit={handleSearch}>
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
                </form>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-slate-800/30 p-4 border-b border-slate-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <select
                    className="appearance-none bg-slate-700/50 border border-slate-600 rounded-lg py-2 pl-9 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={timeFilter}
                    onChange={(e) => {
                      setTimeFilter(e.target.value)
                      handleFilterChange()
                    }}
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="7days">7 ngày qua</option>
                    <option value="30days">30 ngày qua</option>
                    <option value="3months">3 tháng qua</option>
                    <option value="6months">6 tháng qua</option>
                    <option value="1year">1 năm qua</option>
                  </select>
                  <Calendar className="absolute left-3 top-2.5 text-gray-500" size={14} />
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={14} />
                </div>

                <div className="relative">
                  <select
                    className="appearance-none bg-slate-700/50 border border-slate-600 rounded-lg py-2 pl-9 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      handleFilterChange()
                    }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="highest">Giá cao nhất</option>
                    <option value="lowest">Giá thấp nhất</option>
                  </select>
                  <Filter className="absolute left-3 top-2.5 text-gray-500" size={14} />
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={14} />
                </div>
              </div>

              <button
                onClick={() => fetchPurchaseHistory()}
                className="flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg py-2 px-4 text-sm transition-colors"
              >
                <RefreshCw size={14} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-800/30 border-b border-slate-700">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Tổng đơn hàng</p>
                  <p className="text-white text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-primary text-xs mt-1 flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    Đã hoàn thành
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Package size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Tổng chi tiêu</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                  <p className="text-green-400 text-xs mt-1">Tích lũy từ đầu</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard size={24} className="text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Tổng sản phẩm</p>
                  <p className="text-white text-2xl font-bold">{stats.totalItems}</p>
                  <p className="text-blue-400 text-xs mt-1">Món ăn đã mua</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Star size={24} className="text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Giá trị TB/đơn</p>
                  <p className="text-white text-2xl font-bold">
                    {stats.totalOrders > 0 ? formatCurrency(stats.totalSpent / stats.totalOrders) : formatCurrency(0)}
                  </p>
                  <p className="text-purple-400 text-xs mt-1">Trung bình</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={24} className="text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-400">Đang tải lịch sử mua hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Package size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl text-gray-300 mb-2">Bạn chưa có lịch sử mua hàng nào</h2>
                <p className="text-gray-400 mb-6">Hãy đặt món ăn đầu tiên của bạn ngay bây giờ</p>
                <button
                  onClick={() => navigate("/foods")}
                  className="bg-gradient-to-r from-primary to-primary-dark text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
                >
                  Xem thực đơn
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((purchase, index) => (
                  <motion.div
                    key={purchase._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-slate-700/30 backdrop-blur-sm rounded-xl border border-slate-600 overflow-hidden hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Purchase Header */}
                    <div className="bg-slate-800/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-600">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mr-3">
                          <Package size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">#{purchase._id.slice(-8).toUpperCase()}</p>
                          <p className="text-gray-400 text-xs">{formatDate(purchase.purchaseDate)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle size={12} className="mr-1" />
                          <span className="ml-1">Đã hoàn thành</span>
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(purchase.paymentStatus)}`}
                        >
                          {purchase.paymentStatus || "Đã thanh toán"}
                        </span>
                      </div>
                    </div>

                    {/* Purchase Content */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Purchase Items */}
                        <div className="md:col-span-2">
                          <h3 className="text-xs uppercase text-gray-400 mb-3 font-medium flex items-center">
                            <Star className="mr-1" size={12} />
                            Sản phẩm ({purchase.items.length} món)
                          </h3>
                          <div className="space-y-3 max-h-32 overflow-y-auto pr-2 scrollbar-hide">
                            {purchase.items.map((item, idx) => (
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

                        {/* Purchase Info */}
                        <div className="border-t md:border-t-0 md:border-l border-slate-600 pt-4 md:pt-0 md:pl-4">
                          <h3 className="text-xs uppercase text-gray-400 mb-3 font-medium">Thông tin giao hàng</h3>
                          <div className="space-y-2 text-sm">
                            <p className="flex justify-between">
                              <span className="text-gray-400">Người nhận:</span>
                              <span className="text-white font-medium">{purchase.deliveryAddress?.name || "N/A"}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-400">SĐT:</span>
                              <span className="text-white">{purchase.deliveryAddress?.phone || "N/A"}</span>
                            </p>
                            <p className="flex flex-col">
                              <span className="text-gray-400">Địa chỉ:</span>
                              <span className="text-white text-right text-xs mt-1 break-words">
                                {purchase.deliveryAddress?.street || "N/A"}
                              </span>
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                              <div className="flex items-center">
                                {getPaymentMethodIcon(purchase.paymentMethod)}
                                <span className="ml-2 text-xs text-gray-400">
                                  {purchase.paymentMethod === "COD"
                                    ? "COD"
                                    : purchase.paymentMethod === "VNPay"
                                      ? "VNPay"
                                      : purchase.paymentMethod === "MoMo"
                                        ? "MoMo"
                                        : "Bank"}
                                </span>
                              </div>
                              <span className="text-lg font-bold text-primary">
                                {purchase.totalAmount.toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => handleBuyAgain(purchase.items)}
                              className="w-full bg-primary hover:bg-primary-dark text-slate-900 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                            >
                              <RefreshCw size={14} className="mr-2" />
                              Mua lại
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${
                          currentPage === 1 ? "text-gray-500 cursor-not-allowed" : "text-white hover:bg-slate-700/50"
                        }`}
                      >
                        <ChevronUp className="rotate-90" size={20} />
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1
                        // Show current page, first, last, and pages around current
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-lg ${
                                currentPage === page
                                  ? "bg-primary text-slate-900 font-bold"
                                  : "text-white hover:bg-slate-700/50"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (
                          (page === 2 && currentPage > 3) ||
                          (page === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <span key={page} className="text-gray-500 px-1">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${
                          currentPage === totalPages
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-white hover:bg-slate-700/50"
                        }`}
                      >
                        <ChevronDown className="rotate-90" size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PurchaseHistory
