"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import ConfirmModal from "../../components/ConfirmModal"
import Pagination from "../../components/Pagination"
import OrderSearchBar from "../../components/orders/OrderSearchBar"
import OrderStatusFilter from "../../components/orders/OrderStatusFilter"
import OrderCard from "../../components/orders/OrderCard"
import EmptyOrderState from "../../components/orders/EmptyOrderState"

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
    newStatus: "",
    title: "",
    message: "",
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Phí ship cố định
  const SHIPPING_FEE = 14000

  // Fetch all orders from API
  const fetchAllOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(url + "/api/order/list")
      if (response.data.success) {
        // Sort orders by date (newest first)
        const sortedOrders = response.data.data.sort((a, b) => {
          return new Date(b.date) - new Date(a.date)
        })
        console.log("Orders data:", sortedOrders) // Debug log
        setOrders(sortedOrders)
        setFilteredOrders(sortedOrders)
      } else {
        toast.error(response.data.message || "Lỗi khi tải danh sách đơn hàng")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error(error.response?.data?.message || "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Update order status
  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value

    setConfirmModal({
      isOpen: true,
      orderId: orderId,
      newStatus: newStatus,
      title: "Xác nhận thay đổi trạng thái",
      message: `Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng thành "${newStatus}"?`,
    })
  }

  const handleConfirmStatusChange = async () => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId: confirmModal.orderId,
        status: confirmModal.newStatus,
      })

      if (response.data.success) {
        await fetchAllOrders()
        toast.success("Trạng thái đơn hàng đã được cập nhật")
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật trạng thái đơn hàng")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.")
    }

    // Close the confirmation modal
    setConfirmModal({
      isOpen: false,
      orderId: null,
      newStatus: "",
      title: "",
      message: "",
    })
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  useEffect(() => {
    // Filter orders based on search term and status filter
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.address.phone.includes(searchTerm) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.voucherCode && order.voucherCode.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "Tất cả") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, statusFilter, orders])

  // Get current page items
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
  }

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Format date function
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
    return amount?.toLocaleString("vi-VN") + " đ" || "0 đ"
  }

  const currentItems = getCurrentItems()

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">Quản lý đơn hàng</h1>

        <div className="flex flex-col md:flex-row justify-between gap-3 mb-4 md:mb-6">
          {/* Search Bar */}
          <OrderSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {/* Status Filter */}
          <OrderStatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} onRefresh={fetchAllOrders} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {currentItems.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                url={url}
                onStatusChange={statusHandler}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                SHIPPING_FEE={SHIPPING_FEE}
              />
            ))}

            {/* Pagination */}
            <div className="px-3 md:px-0">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        ) : (
          <EmptyOrderState />
        )}
      </div>

      {/* Confirm Status Change Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            orderId: null,
            newStatus: "",
            title: "",
            message: "",
          })
        }
        onConfirm={handleConfirmStatusChange}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  )
}

export default Orders
