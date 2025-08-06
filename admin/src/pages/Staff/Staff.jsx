"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Plus, Search, Users, Bell } from 'lucide-react'
import StaffModal from "./StaffModal"
import StaffTable from "../../components/staff/StaffTable"
import StaffFilters from "../../components/staff/StaffFilters"
import StaffStats from "../../components/staff/StaffStats"
import ConfirmModal from "../../components/ConfirmModal"
import NotificationModal from "../../components/staff/NotificationModal"

const Staff = ({ url }) => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("add") // add, edit, view
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, staffId: null, staffName: "" })
  const [notificationModal, setNotificationModal] = useState(false)

  const itemsPerPage = 10

  // Fetch staff list
  const fetchStaff = async (page = 1, search = "", status = "all") => {
    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/staff/list`, {
        params: {
          page,
          limit: itemsPerPage,
          search,
          status,
        },
      })

      if (response.data.success) {
        setStaff(response.data.data)
        setTotalPages(response.data.pagination.total)
        setTotalRecords(response.data.pagination.totalRecords)
      } else {
        toast.error(response.data.message || "Lỗi khi tải danh sách nhân viên")
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff(currentPage, searchTerm, statusFilter)
  }, [currentPage, searchTerm, statusFilter])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchStaff(1, searchTerm, statusFilter)
  }

  // Handle filter change
  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus)
    setCurrentPage(1)
  }

  // Handle add staff
  const handleAddStaff = () => {
    setSelectedStaff(null)
    setModalMode("add")
    setModalOpen(true)
  }

  // Handle edit staff
  const handleEditStaff = (staffMember) => {
    setSelectedStaff(staffMember)
    setModalMode("edit")
    setModalOpen(true)
  }

  // Handle view staff
  const handleViewStaff = (staffMember) => {
    setSelectedStaff(staffMember)
    setModalMode("view")
    setModalOpen(true)
  }

  // Handle delete staff
  const handleDeleteStaff = (staffMember) => {
    setConfirmModal({
      isOpen: true,
      staffId: staffMember._id,
      staffName: staffMember.name,
    })
  }

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const response = await axios.post(`${url}/api/staff/delete`, {
        id: confirmModal.staffId,
      })

      if (response.data.success) {
        toast.success(response.data.message)
        fetchStaff(currentPage, searchTerm, statusFilter)
      } else {
        toast.error(response.data.message || "Lỗi khi xóa nhân viên")
      }
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    }

    setConfirmModal({ isOpen: false, staffId: null, staffName: "" })
  }

  // Handle status toggle
  const handleStatusToggle = async (staffId, currentStatus) => {
    try {
      const response = await axios.post(`${url}/api/staff/update-status`, {
        id: staffId,
        isActive: !currentStatus,
      })

      if (response.data.success) {
        toast.success(response.data.message)
        fetchStaff(currentPage, searchTerm, statusFilter)
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật trạng thái")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    }
  }

  // Handle modal success
  const handleModalSuccess = () => {
    setModalOpen(false)
    setSelectedStaff(null)
    fetchStaff(currentPage, searchTerm, statusFilter)
  }

  // Handle notification modal success
  const handleNotificationSuccess = () => {
    setNotificationModal(false)
  }

  // Calculate stats
  const activeStaff = staff.filter((s) => s.isActive === true).length
  const inactiveStaff = staff.filter((s) => s.isActive === false).length

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
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Quản lý nhân viên</h1>
              <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin và quyền hạn nhân viên</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Button */}
            <button
              onClick={() => setNotificationModal(true)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
              title="Gửi thông báo"
            >
              <Bell size={20} />
              <span className="hidden sm:inline">Gửi thông báo</span>
            </button>

            {/* Add Staff Button */}
            <button
              onClick={handleAddStaff}
              className="flex items-center space-x-2 bg-gradient-golden text-white px-4 py-2 rounded-xl hover:shadow-golden/20 transition-all duration-300"
            >
              <Plus size={20} />
              <span>Thêm nhân viên</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <StaffStats total={totalRecords} active={activeStaff} inactive={inactiveStaff} />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white"
              />
            </div>
          </form>

          {/* Status Filter */}
          <StaffFilters statusFilter={statusFilter} onFilterChange={handleFilterChange} />
        </div>

        {/* Staff Table */}
        <StaffTable
          staff={staff}
          loading={loading}
          onEdit={handleEditStaff}
          onView={handleViewStaff}
          onDelete={handleDeleteStaff}
          onStatusToggle={handleStatusToggle}
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

      {/* Staff Modal */}
      {modalOpen && (
        <StaffModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
          mode={modalMode}
          staff={selectedStaff}
          url={url}
        />
      )}

      {/* Notification Modal */}
      {notificationModal && (
        <NotificationModal
          isOpen={notificationModal}
          onClose={() => setNotificationModal(false)}
          onSuccess={handleNotificationSuccess}
          staff={staff.filter(s => s.isActive)} // Only active staff
          url={url}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, staffId: null, staffName: "" })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${confirmModal.staffName}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  )
}

export default Staff
