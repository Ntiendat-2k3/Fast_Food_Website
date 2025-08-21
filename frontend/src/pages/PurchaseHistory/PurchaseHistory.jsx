"use client"

import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import {
  Package,
  Clock,
  CreditCard,
  Truck,
  Wallet,
  Landmark,
  Search,
  Star,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Gift,
  Receipt,
  Zap,
  Crown,
  ChevronRight,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [selectedOrder, setSelectedOrder] = useState(null)
  const itemsPerPage = 6

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

      if (response.data.success) {
        // Chỉ lấy những đơn hàng đã hoàn thành
        const completedOrders = response.data.data.filter(
          (order) =>
            order.status === "Đã giao" ||
            order.status === "Đã giao hàng" ||
            order.status === "Đã hoàn thành" ||
            order.customerConfirmed === true,
        )

        setData(completedOrders)
        calculateStats(completedOrders)
      } else {
        toast.error(response.data.message || "Không thể tải lịch sử mua hàng")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
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
        return <Truck size={14} className="text-yellow-400" />
      case "VNPay":
        return <CreditCard size={14} className="text-blue-400" />
      case "MoMo":
        return <Wallet size={14} className="text-pink-400" />
      case "BankTransfer":
        return <Landmark size={14} className="text-green-400" />
      default:
        return <CreditCard size={14} className="text-gray-400" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Không có ngày"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Ngày không hợp lệ"
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBuyAgain = async (items, orderId) => {
    try {
      setReorderingId(orderId)
      let addedItems = 0
      const unavailableItems = []

      for (const item of items) {
        const foodItem = food_list.find((food) => food.name === item.name)

        if (foodItem) {
          await addToCart(foodItem._id, item.quantity)
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
    const product = food_list.find((item) => item.name === productName)
    if (product) {
      const slug = product.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()

      navigate(`/product/${slug}`)
    } else {
      toast.error("Sản phẩm không tồn tại!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black pt-20 pb-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl flex items-center justify-center mr-3 border border-yellow-500/30">
              <Crown className="text-yellow-400" size={24} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              Lịch sử mua hàng
            </h1>
          </div>
          <p className="text-gray-400">Những món ăn ngon bạn đã thưởng thức</p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-yellow-500/20"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value)
                  handleFilterChange()
                }}
                className="bg-slate-700/50 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                <option value="all">Tất cả</option>
                <option value="7days">7 ngày</option>
                <option value="30days">30 ngày</option>
                <option value="3months">3 tháng</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  handleFilterChange()
                }}
                className="bg-slate-700/50 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="highest">Giá cao</option>
                <option value="lowest">Giá thấp</option>
              </select>

              <button
                onClick={() => fetchOrders()}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl px-4 py-2.5 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng đơn hàng</p>
                <p className="text-white text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng chi tiêu</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tổng sản phẩm</p>
                <p className="text-white text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Orders List */}
          <div className={`${selectedOrder ? "w-1/2" : "w-full"} transition-all duration-300`}>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Đang tải...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-gray-400" />
                </div>
                <h2 className="text-xl text-gray-300 mb-2">Chưa có lịch sử mua hàng</h2>
                <p className="text-gray-400 mb-6">Hãy đặt món ăn đầu tiên của bạn</p>
                <button
                  onClick={() => navigate("/foods")}
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Xem thực đơn
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl border ${
                      selectedOrder?._id === order._id ? "border-yellow-500/60" : "border-yellow-500/20"
                    } overflow-hidden hover:border-yellow-500/40 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                            <Receipt size={18} className="text-yellow-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">#{order._id.slice(-6).toUpperCase()}</h3>
                            <p className="text-gray-400 text-sm flex items-center">
                              <Clock size={12} className="mr-1" />
                              {formatDate(order.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-yellow-400 font-bold text-lg">{order.amount.toLocaleString("vi-VN")}đ</p>
                            <div className="flex items-center gap-2 justify-end">
                              {getPaymentMethodIcon(order.paymentMethod)}
                              <span className="text-gray-300 text-sm">
                                {order.paymentMethod === "COD" ? "COD" : order.paymentMethod}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-yellow-400" />
                        </div>
                      </div>

                      {/* Products Preview */}
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                            <div className="w-12 h-12 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={url + "/images/" + item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg?height=48&width=48"
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{item.name}</p>
                              <p className="text-gray-400 text-xs">
                                {item.price.toLocaleString("vi-VN")}đ × {item.quantity}
                              </p>
                            </div>
                            <div className="text-yellow-400 font-semibold text-sm">
                              {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-center py-2">
                            <span className="text-gray-400 text-sm">+{order.items.length - 2} món khác</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-white hover:bg-slate-700/50 hover:text-yellow-400"
                    }`}
                  >
                    <ChevronUp className="rotate-90" size={18} />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            currentPage === page
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold"
                              : "text-white hover:bg-slate-700/50 hover:text-yellow-400"
                          }`}
                        >
                          {page}
                        </button>
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
                        : "text-white hover:bg-slate-700/50 hover:text-yellow-400"
                    }`}
                  >
                    <ChevronDown className="rotate-90" size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Details Sidebar */}
          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.3 }}
                className="w-1/2 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl border border-yellow-500/20 p-6 h-fit sticky top-24"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                      <Receipt size={20} className="text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold">#{selectedOrder._id.slice(-6).toUpperCase()}</h3>
                      <p className="text-gray-400 text-sm">{formatDate(selectedOrder.date)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="text-yellow-400 font-semibold mb-4 flex items-center">
                    <ShoppingCart size={16} className="mr-2" />
                    Sản phẩm ({selectedOrder.items.length} món)
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
                        onClick={() => handleProductClick(item.name)}
                      >
                        <div className="w-16 h-16 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={url + "/images/" + item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg?height=64&width=64"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-yellow-400 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {item.price.toLocaleString("vi-VN")}đ × {item.quantity}
                          </p>
                        </div>
                        <div className="text-yellow-400 font-semibold">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mb-6">
                  <h4 className="text-yellow-400 font-semibold mb-4 flex items-center">
                    <CreditCard size={16} className="mr-2" />
                    Thanh toán
                  </h4>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                        {getPaymentMethodIcon(selectedOrder.paymentMethod)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {selectedOrder.paymentMethod === "COD"
                            ? "Thanh toán khi nhận hàng"
                            : selectedOrder.paymentMethod}
                        </p>
                        <p className="text-gray-400 text-sm">Đã thanh toán</p>
                      </div>
                    </div>
                    {selectedOrder.voucherCode && (
                      <div className="flex items-center gap-2 text-green-400 bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                        <Gift size={16} />
                        <div>
                          <p className="font-medium">Mã giảm giá: {selectedOrder.voucherCode}</p>
                          <p className="text-sm">Tiết kiệm: {selectedOrder.discountAmount?.toLocaleString("vi-VN")}đ</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-lg p-4 space-y-3 border border-yellow-500/20">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Tổng phụ:</span>
                      <span>
                        {selectedOrder.items
                          .reduce((sum, item) => sum + item.price * item.quantity, 0)
                          .toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-400">
                        <span>Giảm giá:</span>
                        <span>-{selectedOrder.discountAmount.toLocaleString("vi-VN")}đ</span>
                      </div>
                    )}
                    <div className="border-t border-yellow-500/20 pt-3">
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>Tổng cộng:</span>
                        <span className="text-yellow-400">{selectedOrder.amount.toLocaleString("vi-VN")}đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buy Again Button */}
                <button
                  onClick={() => handleBuyAgain(selectedOrder.items, selectedOrder._id)}
                  disabled={reorderingId === selectedOrder._id}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-yellow-500/50 disabled:to-amber-500/50 text-black py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {reorderingId === selectedOrder._id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3" />
                      Đang thêm vào giỏ hàng...
                    </>
                  ) : (
                    <>
                      <Zap size={20} className="mr-3" />
                      Mua lại đơn hàng này
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default PurchaseHistory
