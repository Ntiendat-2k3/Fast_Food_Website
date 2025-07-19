"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { Package, TrendingUp, Clock, CheckCircle, RefreshCw, Download, DollarSign } from "lucide-react"
import OrderCard from "../../components/orders/OrderCard"
import OrderSearchBar from "../../components/orders/OrderSearchBar"
import OrderStatusFilter from "../../components/orders/OrderStatusFilter"
import EmptyOrderState from "../../components/orders/EmptyOrderState"

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    revenue: 0,
  })

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        const ordersData = response.data.data
        // Sắp xếp theo thời gian mới nhất lên đầu
        const sortedOrders = ordersData.sort((a, b) => new Date(b.date) - new Date(a.date))
        setOrders(sortedOrders)
        setFilteredOrders(sortedOrders)
        calculateStats(sortedOrders)
      } else {
        toast.error("Lỗi khi tải danh sách đơn hàng")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Lỗi kết nối server")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter((order) => order.status === "Đang xử lý").length,
      processing: ordersData.filter((order) => order.status === "Đang giao hàng").length,
      delivered: ordersData.filter((order) => order.status === "Đã giao").length,
      // Chỉ tính doanh thu từ đơn hàng đã giao
      revenue: ordersData.filter((order) => order.status === "Đã giao").reduce((sum, order) => sum + order.amount, 0),
    }
    setStats(stats)
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value,
      })
      if (response.data.success) {
        await fetchAllOrders()
        toast.success("Cập nhật trạng thái thành công")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Lỗi khi cập nhật trạng thái")
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: "Đã hủy",
      })
      if (response.data.success) {
        await fetchAllOrders()
        toast.success("Hủy đơn hàng thành công")
      }
    } catch (error) {
      console.error("Error canceling order:", error)
      toast.error("Lỗi khi hủy đơn hàng")
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    filterOrders(term, statusFilter)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    filterOrders(searchTerm, status)
  }

  const filterOrders = (search, status) => {
    let filtered = orders

    if (search) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(search.toLowerCase()) ||
          order.address.name.toLowerCase().includes(search.toLowerCase()) ||
          order.address.phone.includes(search),
      )
    }

    if (status !== "all") {
      filtered = filtered.filter((order) => order.status === status)
    }

    setFilteredOrders(filtered)
  }

  const handleExportInvoice = async (orderId) => {
    try {
      toast.info("Đang tạo hóa đơn...", { autoClose: 2000 })
      const response = await axios.get(`${url}/api/order/export-invoice/${orderId}`, {
        responseType: "blob", // Important for downloading files
      })

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" })
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = downloadUrl
        link.setAttribute("download", `invoice_${orderId.slice(-8).toUpperCase()}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(downloadUrl)
        toast.success("Hóa đơn đã được tải xuống!")
      } else {
        toast.error("Không thể tạo hóa đơn.")
      }
    } catch (error) {
      console.error("Error exporting invoice:", error)
      toast.error("Lỗi khi xuất hóa đơn. Vui lòng thử lại.")
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-lg">Đang tải đơn hàng...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-yellow-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-amber-400/4 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Quản lý đơn hàng</h1>
              <p className="text-gray-400">Theo dõi và xử lý các đơn hàng</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="stats-card-compact">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-gray-400">Tổng đơn</p>
                </div>
              </div>
            </div>

            <div className="stats-card-compact">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  <p className="text-xs text-gray-400">Chờ xử lý</p>
                </div>
              </div>
            </div>

            <div className="stats-card-compact">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.processing}</p>
                  <p className="text-xs text-gray-400">Đang giao</p>
                </div>
              </div>
            </div>

            <div className="stats-card-compact">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.delivered}</p>
                  <p className="text-xs text-gray-400">Hoàn thành</p>
                </div>
              </div>
            </div>

            <div className="stats-card-compact">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{formatCurrency(stats.revenue)}</p>
                  <p className="text-xs text-gray-400">Doanh thu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <OrderSearchBar onSearch={handleSearch} />
            </div>
            <div className="flex gap-3">
              <OrderStatusFilter onFilter={handleStatusFilter} currentFilter={statusFilter} />
              <button
                onClick={fetchAllOrders}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-300 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Xuất file</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={statusHandler}
                onCancelOrder={handleCancelOrder}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                onExportInvoice={handleExportInvoice}
                url={url}
              />
            ))
          ) : (
            <EmptyOrderState />
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
