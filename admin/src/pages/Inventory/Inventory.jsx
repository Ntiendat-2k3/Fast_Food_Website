"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import {
  Package,
  RefreshCw,
  Settings,
  Search,
  Filter,
  RotateCcw,
  Edit,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  X,
  Save,
} from "lucide-react"

const Inventory = ({ url }) => {
  const [inventoryItems, setInventoryItems] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal form data
  const [formData, setFormData] = useState({
    quantity: 0,
    maxStockLevel: 1000,
  })

  // Fetch inventory list
  const fetchInventoryList = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const response = await axios.get(`${url}/api/inventory/list?${params}`)

      if (response.data.success) {
        setInventoryItems(response.data.data)
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage)
          setTotalPages(response.data.pagination.totalPages)
        }
      } else {
        toast.error(response.data.message || "Lỗi khi tải danh sách kho hàng")
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  // Fetch inventory statistics
  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const response = await axios.get(`${url}/api/inventory/stats`)

      if (response.data.success) {
        setStats(response.data.data)
      } else {
        toast.error("Lỗi khi tải thống kê kho hàng")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Lỗi khi tải thống kê")
    } finally {
      setStatsLoading(false)
    }
  }

  // Initialize inventory for existing foods
  const initializeInventory = async () => {
    try {
      const response = await axios.post(`${url}/api/inventory/initialize`)

      if (response.data.success) {
        toast.success("Khởi tạo kho hàng thành công")
        fetchInventoryList()
        fetchStats()
      } else {
        toast.error(response.data.message || "Lỗi khi khởi tạo kho hàng")
      }
    } catch (error) {
      console.error("Error initializing inventory:", error)
      toast.error("Lỗi khi khởi tạo kho hàng")
    }
  }

  // Update inventory item
  const updateInventoryItem = async (data) => {
    try {
      const response = await axios.post(`${url}/api/inventory/update`, data)

      if (response.data.success) {
        toast.success("Cập nhật kho hàng thành công")
        fetchInventoryList(currentPage)
        fetchStats()
        setModalOpen(false)
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật kho hàng")
      }
    } catch (error) {
      console.error("Error updating inventory:", error)
      toast.error("Lỗi khi cập nhật kho hàng")
    }
  }

  // Handle edit click
  const handleEditClick = (item) => {
    setSelectedItem(item)
    setFormData({
      quantity: item.quantity || 0,
      maxStockLevel: item.maxStockLevel || 1000,
    })
    setModalOpen(true)
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateInventoryItem({
      foodId: selectedItem.foodId._id,
      ...formData,
      updatedBy: "admin",
    })
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchInventoryList(page)
  }

  // Handle filter reset
  const handleFilterReset = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  // Get status display
  const getStatusIcon = (status) => {
    switch (status) {
      case "in_stock":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "out_of_stock":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Package className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "in_stock":
        return "Còn hàng"
      case "low_stock":
        return "Sắp hết"
      case "out_of_stock":
        return "Hết hàng"
      default:
        return "Không xác định"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "in_stock":
        return "bg-green-900/30 text-green-300 border border-green-700"
      case "low_stock":
        return "bg-yellow-900/30 text-yellow-300 border border-yellow-700"
      case "out_of_stock":
        return "bg-red-900/30 text-red-300 border border-red-700"
      default:
        return "bg-gray-900/30 text-gray-300 border border-gray-700"
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchInventoryList()
    fetchStats()
  }, [])

  // Reload data when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchInventoryList(1)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  const statCards = [
    {
      title: "Tổng sản phẩm",
      value: stats?.totalItems || 0,
      icon: Package,
      color: "text-yellow-400",
      bgColor: "bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-700/50",
    },
    {
      title: "Còn hàng",
      value: stats?.inStock || 0,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50",
    },
    {
      title: "Sắp hết hàng",
      value: stats?.lowStock || 0,
      icon: AlertTriangle,
      color: "text-yellow-400",
      bgColor: "bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-700/50",
    },
    {
      title: "Hết hàng",
      value: stats?.outOfStock || 0,
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50",
    },
  ]

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "in_stock", label: "Còn hàng" },
    { value: "low_stock", label: "Sắp hết hàng" },
    { value: "out_of_stock", label: "Hết hàng" },
  ]

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900/20">
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm md:rounded-2xl md:shadow-2xl border border-yellow-700/30 p-3 md:p-6 mb-4 md:mb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="p-2 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg mr-3">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Quản lý kho hàng
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fetchInventoryList(currentPage)}
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2 border border-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>

            <button
              onClick={initializeInventory}
              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <Settings className="h-4 w-4" />
              Khởi tạo kho
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse border border-gray-700">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              ))
            : statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className={`${stat.bgColor} rounded-xl p-6 shadow-lg backdrop-blur-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-black/20 rounded-lg">
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                )
              })}
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg border border-yellow-700/30">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-yellow-700/50 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-900/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-4 w-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-yellow-700/50 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-900/50 text-white appearance-none backdrop-blur-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleFilterReset}
              className="px-4 py-2 border border-yellow-700/50 text-yellow-300 rounded-lg hover:bg-yellow-900/20 transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Đặt lại
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-yellow-700/30 overflow-hidden">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4 mb-4">
                    <div className="h-12 w-12 bg-gray-700 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-700/30">
                <thead className="bg-gradient-to-r from-gray-900 to-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Tồn kho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Tối đa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Cập nhật
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 divide-y divide-yellow-700/20">
                  {inventoryItems.map((item) => (
                    <tr key={item._id} className="hover:bg-yellow-900/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover border border-yellow-700/30"
                              src={
                                item.foodId?.image
                                  ? `${url}/images/${item.foodId.image}`
                                  : "/placeholder.svg?height=48&width=48"
                              }
                              alt={item.foodId?.name || "Product"}
                              onError={(e) => {
                                e.target.src = "/placeholder.svg?height=48&width=48"
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {item.foodId?.name || "Sản phẩm không xác định"}
                            </div>
                            <div className="text-sm text-gray-400">{item.foodId?.category || "Không có danh mục"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{item.quantity.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {item.maxStockLevel.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{getStatusText(item.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(item.lastUpdated).toLocaleDateString("vi-VN")}
                        <div className="text-xs text-yellow-400">{item.updatedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors p-2 hover:bg-yellow-900/20 rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 flex items-center justify-between border-t border-yellow-700/30 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-yellow-700/50 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-yellow-700/50 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Trang <span className="font-medium text-yellow-400">{currentPage}</span> /{" "}
                    <span className="font-medium text-yellow-400">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-yellow-700/50 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? "z-10 bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500 text-white"
                              : "bg-gray-800 border-yellow-700/50 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-yellow-700/50 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && inventoryItems.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full w-16 h-16 mx-auto mb-4">
              <Package className="h-8 w-8 text-white mx-auto mt-2" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Chưa có dữ liệu kho hàng</h3>
            <p className="text-gray-400 mb-4">Nhấn "Khởi tạo kho" để tạo dữ liệu kho hàng cho các sản phẩm hiện có</p>
            <button
              onClick={initializeInventory}
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-lg"
            >
              Khởi tạo kho hàng
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-yellow-700/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Package className="h-6 w-6 mr-2" />
                  <h2 className="text-xl font-bold">Cập nhật kho hàng</h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg border border-yellow-700/30">
                <img
                  src={
                    selectedItem.foodId?.image
                      ? `${url}/images/${selectedItem.foodId.image}`
                      : "/placeholder.svg?height=64&width=64"
                  }
                  alt={selectedItem.foodId?.name}
                  className="h-16 w-16 rounded-lg object-cover border border-yellow-700/30"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=64&width=64"
                  }}
                />
                <div className="ml-4">
                  <h3 className="font-semibold text-white">{selectedItem.foodId?.name}</h3>
                  <p className="text-sm text-gray-400">{selectedItem.foodId?.category}</p>
                  <p className="text-sm font-medium text-yellow-400">
                    {selectedItem.foodId?.price?.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                    required
                    className="w-full px-4 py-3 border border-yellow-700/50 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-900/50 text-white placeholder-gray-400 backdrop-blur-sm"
                    placeholder="Nhập số lượng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mức tồn kho tối đa *</label>
                  <input
                    type="number"
                    value={formData.maxStockLevel}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxStockLevel: Number.parseInt(e.target.value) || 0 }))
                    }
                    min="1"
                    required
                    className="w-full px-4 py-3 border border-yellow-700/50 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-900/50 text-white placeholder-gray-400 backdrop-blur-sm"
                    placeholder="Nhập mức tối đa"
                  />
                </div>

                {/* Current Status */}
                <div className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-lg border border-yellow-700/30">
                  <h4 className="font-medium text-white mb-2">Trạng thái hiện tại</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Tồn kho:</span>
                      <span className="ml-2 font-medium text-white">{selectedItem.quantity?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Trạng thái:</span>
                      <span
                        className={`ml-2 font-medium ${
                          selectedItem.status === "in_stock"
                            ? "text-green-400"
                            : selectedItem.status === "low_stock"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {selectedItem.status === "in_stock"
                          ? "Còn hàng"
                          : selectedItem.status === "low_stock"
                            ? "Sắp hết"
                            : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-yellow-700/50 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Save className="h-4 w-4" />
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
