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
  MapPin,
  Phone,
  User,
  Receipt,
  Gift,
} from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const PurchaseHistory = () => {
  const { url, token, user, addToCart, food_list } = useContext(StoreContext)
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
  const [reorderingId, setReorderingId] = useState(null)
  const itemsPerPage = 10

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/")
      toast.error("Vui lòng đăng nhập để xem lịch sử mua hàng")
    }
  }, [token, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log("Fetching orders with token:", token)

      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("API Response:", response.data)

      if (response.data.success) {
        // Chỉ lấy những đơn hàng đã hoàn thành (đã giao hàng hoặc đã xác nhận)
        const completedOrders = response.data.data.filter(
          (order) =>
            order.status === "Đã giao" ||
            order.status === "Đã giao hàng" ||
            order.status === "Đã hoàn thành" ||
            order.customerConfirmed === true,
        )

        console.log("Completed orders:", completedOrders)
        setData(completedOrders)
        calculateStats(completedOrders)
      } else {
        console.error("API Error:", response.data.message)
        toast.error(response.data.message || "Không thể tải lịch sử mua hàng")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      if (error.response) {
        console.error("Error response:", error.response.data)
        console.error("Error status:", error.response.status)
      }
      toast.error("Lỗi khi tải lịch sử mua hàng")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (orders) => {
    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0)
    const totalItems = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)

    setStats({
      totalSpent,
      totalOrders: orders.length,
      totalItems,
    })
  }

  useEffect(() => {
    if (token && user) {
      fetchOrders()
    }
  }, [token, user])

  useEffect(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.address?.name && order.address.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date()
      let startDate

      switch (timeFilter) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "3months":
          startDate = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000)
          break
        case "6months":
          startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
          break
        case "1year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }

      if (startDate) {
        filtered = filtered.filter((order) => new Date(order.date) >= startDate)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date) - new Date(a.date)
        case "oldest":
          return new Date(a.date) - new Date(b.date)
        case "highest":
          return b.amount - a.amount
        case "lowest":
          return a.amount - b.amount
        default:
          return new Date(b.date) - new Date(a.date)
      }
    })

    // Apply pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedOrders = filtered.slice(startIndex, startIndex + itemsPerPage)

    setFilteredOrders(paginatedOrders)
    setTotalPages(totalPages)
  }, [data, searchTerm, timeFilter, sortBy, currentPage])

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
        return "bg-green-500/20 text-green-400 border border-green-500/30"
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
    setCurrentPage(1)
  }

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle buy again
  const handleBuyAgain = async (items, orderId) => {
    try {
      setReorderingId(orderId)
      let addedItems = 0
      const unavailableItems = []

      for (const item of items) {
        const foodItem = food_list.find((food) => food.name === item.name)

        if (foodItem) {
          await addToCart(item.name, item.quantity)
          addedItems++
        } else {
          unavailableItems.push(item.name)
        }
      }

      if (addedItems > 0) {
        toast.success(`Đã thêm ${addedItems} sản phẩm vào giỏ hàng!`)
      }

      if (unavailableItems.length > 0) {
        toast.error(`Một số sản phẩm không còn khả dụng: ${unavailableItems.join(", ")}`)
      }

      if (addedItems === 0) {
        toast.error("Không có sản phẩm nào có thể thêm vào giỏ hàng")
      }
    } catch (error) {
      console.error("Error reordering:", error)
      toast.error("Lỗi khi mua lại đơn hàng")
    } finally {
      setReorderingId(null)
    }
  }

  const handleProductClick = (productName) => {
    // Tìm sản phẩm trong food_list
    const product = food_list.find((item) => item.name === productName)
    if (product) {
      // Tạo slug từ tên sản phẩm
      const slug = product.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()

      // Navigate đến trang chi tiết sản phẩm
      navigate(`/product/${slug}`)
    } else {
      toast.error("Sản phẩm không tồn tại!")
    }
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
          {/* Header */}
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4 border border-primary/30">
                  <Sparkles className="text-primary" size={24} />
                </div>
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
                onClick={() => fetchOrders()}
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
              <div className="space-y-6">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-600/50 overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-600/50">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4 border border-primary/30">
                          <Receipt size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">#{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-gray-400 text-sm flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatDate(order.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <span className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle size={12} className="mr-1" />
                          <span className="ml-1">Đã hoàn thành</span>
                        </span>
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus || "Đã thanh toán")}`}
                        >
                          {order.paymentStatus || "Đã thanh toán"}
                        </span>
                      </div>
                    </div>

                    {/* Order Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Order Items */}
                        <div className="lg:col-span-2">
                          <h3 className="text-sm uppercase text-primary mb-4 font-semibold flex items-center">
                            <ShoppingCart className="mr-2" size={16} />
                            Sản phẩm ({order.items.length} món)
                          </h3>
                          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600/30 hover:border-primary/30 transition-colors cursor-pointer group"
                                onClick={() => handleProductClick(item.name)}
                              >
                                <div className="flex items-center flex-1">
                                  <div className="w-14 h-14 bg-slate-600/50 rounded-lg overflow-hidden mr-3 flex-shrink-0 border border-slate-500/30">
                                    <img
                                      src={url + "/images/" + item.image || "/placeholder.svg"}
                                      alt={item.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        e.target.src = "/placeholder.svg?height=56&width=56"
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate group-hover:text-primary transition-colors">
                                      {item.name}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                      {item.price.toLocaleString("vi-VN")}đ × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-primary font-semibold whitespace-nowrap ml-3">
                                  {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Summary */}
                          <div className="mt-4 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-lg p-4 space-y-2 border border-slate-600/30">
                            <div className="flex justify-between text-sm text-slate-300">
                              <span>Tổng phụ:</span>
                              <span>
                                {order.items
                                  .reduce((sum, item) => sum + item.price * item.quantity, 0)
                                  .toLocaleString("vi-VN")}
                                đ
                              </span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between text-sm text-green-400">
                                <span className="flex items-center">
                                  <Gift size={14} className="mr-1" />
                                  Giảm giá:
                                </span>
                                <span>-{order.discountAmount.toLocaleString("vi-VN")}đ</span>
                              </div>
                            )}
                            <div className="border-t border-slate-600/50 pt-2 mt-2">
                              <div className="flex justify-between text-lg font-bold text-white">
                                <span>Tổng cộng:</span>
                                <span className="text-primary">{order.amount.toLocaleString("vi-VN")}đ</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Customer Information */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm uppercase text-primary mb-4 font-semibold flex items-center">
                              <User className="mr-2" size={16} />
                              Thông tin giao hàng
                            </h3>

                            <div className="space-y-4">
                              {/* Customer Details */}
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-lg p-4 space-y-3 border border-slate-600/30">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                                    <User className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{order.address?.name || "N/A"}</p>
                                    <p className="text-sm text-slate-300 flex items-center">
                                      <Phone size={12} className="mr-1" />
                                      {order.address?.phone || "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/20 rounded-lg mt-1 border border-primary/30">
                                    <MapPin className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                      {order.address?.street
                                        ? `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`
                                        : "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Information */}
                              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-lg p-4 border border-slate-600/30">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">Phương thức thanh toán</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getPaymentMethodIcon(order.paymentMethod)}
                                      <span className="text-sm text-slate-300">
                                        {order.paymentMethod === "COD"
                                          ? "Thanh toán khi nhận hàng"
                                          : order.paymentMethod === "VNPay"
                                            ? "VNPay"
                                            : order.paymentMethod === "MoMo"
                                              ? "MoMo"
                                              : "Chuyển khoản ngân hàng"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {order.voucherCode && (
                                  <div className="mt-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                                    <p className="text-sm text-green-400 flex items-center">
                                      <Gift size={14} className="mr-2" />
                                      <span className="font-medium">Mã giảm giá:</span>
                                      <span className="ml-1">{order.voucherCode}</span>
                                    </p>
                                    <p className="text-sm text-green-300 mt-1">
                                      Tiết kiệm: {order.discountAmount?.toLocaleString("vi-VN")}đ
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Buy Again Button */}
                          <div className="mt-6">
                            <button
                              onClick={() => handleBuyAgain(order.items, order._id)}
                              disabled={reorderingId === order._id}
                              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary disabled:from-primary/50 disabled:to-primary-dark/50 text-slate-900 py-3 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:scale-100"
                            >
                              {reorderingId === order._id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin mr-2" />
                                  <span>Đang thêm...</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={16} className="mr-2" />
                                  Mua lại
                                </>
                              )}
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
                        className={`p-2 rounded-lg transition-colors ${
                          currentPage === 1
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-white hover:bg-slate-700/50 hover:text-primary"
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
                              className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                                currentPage === page
                                  ? "bg-primary text-slate-900 font-bold shadow-lg"
                                  : "text-white hover:bg-slate-700/50 hover:text-primary"
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
                        className={`p-2 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-white hover:bg-slate-700/50 hover:text-primary"
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
