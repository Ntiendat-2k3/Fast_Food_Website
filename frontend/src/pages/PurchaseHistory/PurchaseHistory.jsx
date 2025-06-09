"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Package,
  Clock,
  CreditCard,
  MapPin,
  RefreshCw,
  FileDown,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  History,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react"

const PurchaseHistory = () => {
  const { url, token, user } = useContext(StoreContext)
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/")
      toast.error("Vui lòng đăng nhập để xem lịch sử mua hàng")
    }
  }, [token, navigate])

  // Test server connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing server connection...")
        console.log("URL:", url)

        // Test basic server connection
        const serverTest = await axios.get(`${url}/`)
        console.log("Server test:", serverTest.data)

        // Test routes endpoint
        const routesTest = await axios.get(`${url}/api/routes`)
        console.log("Available routes:", routesTest.data)

        // Test order router
        const orderTest = await axios.get(`${url}/api/order/test`)
        console.log("Order router test:", orderTest.data)
      } catch (error) {
        console.error("Connection test failed:", error)
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
        })
      }
    }

    if (url) {
      testConnection()
    }
  }, [url])

  // Fetch purchase history
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!token || !user) {
        console.log("Missing token or user:", { token: !!token, user: !!user })
        return
      }

      setLoading(true)
      try {
        console.log("=== FRONTEND DEBUG ===")
        console.log("Token:", token ? "Available" : "Not available")
        console.log("User:", user)
        console.log("URL:", url)

        const requestData = {
          userId: user._id,
        }

        console.log("Request data:", requestData)

        const fullUrl = `${url}/api/order/purchase-history`
        console.log("Full URL:", fullUrl)

        const config = {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
          params: {
            page: currentPage,
            status: statusFilter,
            timeRange: timeFilter,
            search: searchQuery,
            sortBy: sortBy,
          },
        }

        console.log("Request config:", config)

        const response = await axios.post(fullUrl, requestData, config)

        console.log("Full response:", response)
        console.log("Response data:", response.data)

        if (response.data.success) {
          setOrders(response.data.data || [])
          setTotalPages(response.data.totalPages || 1)
          setTotalOrders(response.data.totalOrders || 0)
          setTotalSpent(response.data.totalSpent || 0)

          console.log("Data set successfully:", {
            orders: response.data.data?.length || 0,
            totalPages: response.data.totalPages,
            totalOrders: response.data.totalOrders,
            totalSpent: response.data.totalSpent,
          })
        } else {
          console.log("API returned error:", response.data.message)
          toast.error(response.data.message || "Không thể tải lịch sử mua hàng")
        }
      } catch (error) {
        console.error("Error fetching purchase history:", error)
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
          headers: error.config?.headers,
        })

        if (error.response?.status === 404) {
          toast.error("API endpoint không tồn tại. Vui lòng kiểm tra server.")
        } else {
          toast.error("Lỗi khi tải lịch sử mua hàng: " + (error.response?.data?.message || error.message))
        }
      } finally {
        setLoading(false)
      }
    }

    // Chỉ gọi API khi có token và user
    if (token && user) {
      fetchPurchaseHistory()
    } else {
      console.log("Waiting for token and user...")
      setLoading(false)
    }
  }, [url, token, user, currentPage, statusFilter, timeFilter, searchQuery, sortBy])

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
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

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "Đã giao hàng":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle size={12} className="mr-1" />
            {status}
          </span>
        )
      case "Đang giao hàng":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <Truck size={12} className="mr-1" />
            {status}
          </span>
        )
      case "Đang xử lý":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock size={12} className="mr-1" />
            {status}
          </span>
        )
      case "Đã hủy":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle size={12} className="mr-1" />
            {status}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <AlertCircle size={12} className="mr-1" />
            {status || "Chưa xác định"}
          </span>
        )
    }
  }

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle size={12} className="mr-1" />
            {status}
          </span>
        )
      case "Chưa thanh toán":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock size={12} className="mr-1" />
            {status}
          </span>
        )
      case "Thanh toán thất bại":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle size={12} className="mr-1" />
            {status}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <AlertCircle size={12} className="mr-1" />
            {status || "Chưa xác định"}
          </span>
        )
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filtering
    setIsFilterOpen(false) // Close filter dropdown
  }

  // Handle order click
  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  // Handle buy again
  const handleBuyAgain = (items) => {
    // Implementation would depend on your cart functionality
    toast.info("Tính năng mua lại đang được phát triển")
  }

  // Show loading if waiting for user data
  if (!token || !user) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="animate-spin text-primary mb-4" size={40} />
            <p className="text-gray-400">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <History className="mr-2 text-primary" />
              Lịch sử mua hàng
            </h1>
            <p className="text-gray-400 mt-2">Xem lại các đơn hàng bạn đã đặt</p>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex items-center">
              <ShoppingBag className="text-primary mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Tổng đơn hàng</p>
                <p className="text-white font-bold text-xl">{totalOrders}</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex items-center">
              <DollarSign className="text-primary mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Tổng chi tiêu</p>
                <p className="text-white font-bold text-xl">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-6">
          <h3 className="text-white font-medium mb-2">Debug Info</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Server URL: {url}</p>
            <p>Token: {token ? "✅ Available" : "❌ Missing"}</p>
            <p>User: {user ? `✅ ${user.name} (${user._id})` : "❌ Missing"}</p>
            <p>API Endpoint: {url}/api/order/purchase-history</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn hàng, tên người nhận..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <button type="submit" className="absolute right-3 top-2 text-primary hover:text-primary-dark">
                  Tìm
                </button>
              </form>
            </div>

            {/* Filter Button (Mobile) */}
            <div className="md:hidden">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 text-white hover:bg-slate-700/50 transition-colors"
              >
                <Filter size={18} />
                Bộ lọc
                {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Filters (Desktop) */}
            <div className="hidden md:flex gap-4">
              {/* Status Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    handleFilterChange()
                  }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <Package className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>

              {/* Time Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={timeFilter}
                  onChange={(e) => {
                    setTimeFilter(e.target.value)
                    handleFilterChange()
                  }}
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="3months">3 tháng qua</option>
                  <option value="6months">6 tháng qua</option>
                  <option value="1year">1 năm qua</option>
                </select>
                <Calendar className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  className="appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                <Filter className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>
            </div>
          </div>

          {/* Mobile Filters (Expandable) */}
          {isFilterOpen && (
            <div className="mt-4 flex flex-col gap-3 md:hidden">
              {/* Status Filter */}
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <Package className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>

              {/* Time Filter */}
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="3months">3 tháng qua</option>
                  <option value="6months">6 tháng qua</option>
                  <option value="1year">1 năm qua</option>
                </select>
                <Calendar className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="highest">Giá cao nhất</option>
                  <option value="lowest">Giá thấp nhất</option>
                </select>
                <Filter className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <ChevronDown className="absolute right-3 top-2.5 text-gray-500" size={18} />
              </div>

              <button
                onClick={handleFilterChange}
                className="mt-2 w-full bg-primary hover:bg-primary-dark text-slate-900 font-medium py-2 rounded-lg transition-colors"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="animate-spin text-primary mb-4" size={40} />
            <p className="text-gray-400">Đang tải lịch sử mua hàng...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/50"
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => toggleOrderExpand(order._id)}
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-primary font-medium mr-2">#{order._id.slice(-8).toUpperCase()}</span>
                        <span className="text-gray-400 text-sm">{formatDate(order.date)}</span>
                      </div>
                      <div className="mt-2 sm:mt-0">{getStatusBadge(order.status)}</div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
                      <div className="flex items-center">
                        <Package size={14} className="mr-1 text-gray-500" />
                        <span>{order.items.length} sản phẩm</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard size={14} className="mr-1 text-gray-500" />
                        <span>{order.paymentMethod || "COD"}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-500" />
                        <span className="truncate max-w-[200px]">{order.address?.city || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-white font-bold">{formatCurrency(order.amount)}</div>
                    <div className="flex items-center mt-2">
                      {getPaymentStatusBadge(order.paymentStatus)}
                      <button className="ml-3 text-gray-400 hover:text-primary transition-colors">
                        {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {expandedOrder === order._id && (
                  <div className="border-t border-slate-700 p-4">
                    <h3 className="text-white font-medium mb-3">Chi tiết đơn hàng</h3>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30">
                          <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="text-gray-500" size={24} />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-gray-400 text-sm">
                              {formatCurrency(item.price)} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-white font-medium">{formatCurrency(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-gray-400">
                        <span>Tạm tính:</span>
                        <span>
                          {formatCurrency(order.amount - (order.shippingFee || 0) + (order.discountAmount || 0))}
                        </span>
                      </div>
                      {order.shippingFee > 0 && (
                        <div className="flex justify-between text-gray-400">
                          <span>Phí vận chuyển:</span>
                          <span>{formatCurrency(order.shippingFee || 0)}</span>
                        </div>
                      )}
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ""}:</span>
                          <span>-{formatCurrency(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-700">
                        <span>Tổng cộng:</span>
                        <span>{formatCurrency(order.amount)}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.address && (
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-2">Địa chỉ giao hàng</h4>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-white">{order.address.name}</p>
                          <p className="text-gray-400">{order.address.phone}</p>
                          <p className="text-gray-400">
                            {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.city}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => handleBuyAgain(order.items)}
                        className="bg-primary hover:bg-primary-dark text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Mua lại
                      </button>
                      <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                        <FileDown size={16} className="mr-2" />
                        Xuất PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    <ArrowLeft size={20} />
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
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 text-center">
            <ShoppingBag className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-white text-xl font-medium mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-gray-400 mb-6">Bạn chưa có đơn hàng nào trong lịch sử mua hàng</p>
            <button
              onClick={() => navigate("/foods")}
              className="bg-primary hover:bg-primary-dark text-slate-900 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Mua sắm ngay
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseHistory
