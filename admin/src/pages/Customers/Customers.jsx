"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Users, Search } from "lucide-react"
import ConfirmModal from "../../components/ConfirmModal"
import CustomerTable from "../../components/customers/CustomerTable" // New component

const Customers = ({ url }) => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, userName: "" })

  const itemsPerPage = 10

  // Fetch customer list
  const fetchCustomers = async (page = 1, search = "") => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        setLoading(false)
        return
      }

      // Fetch users with role "user"
      const response = await axios.get(`${url}/api/user/list`, {
        headers: {
          token: token,
        },
        params: {
          page,
          limit: itemsPerPage,
          search,
          role: "user", // Filter by user role
        },
      })

      if (response.data.success) {
        // The backend's getAllUsers doesn't currently support pagination parameters,
        // so we'll handle pagination and search filtering on the frontend for now.
        // If the backend is updated to support pagination, this logic can be simplified.
        let filteredData = response.data.data.filter((user) => user.role === "user")

        if (search.trim() !== "") {
          filteredData = filteredData.filter(
            (user) =>
              user.name.toLowerCase().includes(search.toLowerCase()) ||
              user.email.toLowerCase().includes(search.toLowerCase()),
          )
        }

        setCustomers(filteredData)
        setTotalRecords(filteredData.length)
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage))
      } else {
        toast.error(response.data.message || "Lỗi khi tải danh sách khách hàng")
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers(currentPage, searchTerm)
  }, [currentPage, searchTerm])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCustomers(1, searchTerm)
  }

  // Handle delete customer
  const handleDeleteCustomer = (customer) => {
    setConfirmModal({
      isOpen: true,
      userId: customer._id,
      userName: customer.name,
    })
  }

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        setConfirmModal({ isOpen: false, userId: null, userName: "" })
        return
      }

      const response = await axios.post(
        `${url}/api/user/delete`,
        {
          userId: confirmModal.userId,
        },
        {
          headers: {
            token: token,
          },
        },
      )

      if (response.data.success) {
        toast.success(response.data.message)
        fetchCustomers(currentPage, searchTerm)
      } else {
        toast.error(response.data.message || "Lỗi khi xóa khách hàng")
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    }

    setConfirmModal({ isOpen: false, userId: null, userName: "" })
  }

  const getCurrentCustomers = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return customers.slice(indexOfFirstItem, indexOfLastItem)
  }

  const currentCustomers = getCurrentCustomers()

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-golden rounded-xl">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Quản lý khách hàng</h1>
              <p className="text-gray-600 dark:text-gray-400">Xem và quản lý thông tin khách hàng</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white"
              />
            </div>
          </form>
        </div>

        {/* Customer Table */}
        <CustomerTable
          customers={currentCustomers}
          loading={loading}
          onDelete={handleDeleteCustomer}
          url={url} // Pass url for image loading if needed
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-gradient-golden text-white"
                      : "bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null, userName: "" })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa khách hàng"
        message={`Bạn có chắc chắn muốn xóa khách hàng "${confirmModal.userName}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  )
}

export default Customers
