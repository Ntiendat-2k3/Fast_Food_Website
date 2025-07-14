"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Bell } from "lucide-react"

// Import components
import ConfirmModal from "../../components/ConfirmModal"
import Pagination from "../../components/Pagination"
import NotificationForm from "../../components/comments/NotificationForm" // Reusing existing form
import NotificationCard from "../../components/comments/NotificationCard" // Reusing existing card
import EmptyState from "../../components/comments/EmptyState" // Reusing existing empty state

const Notifications = ({ url }) => {
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([]) // Users for targeting notifications
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, message: "" })

  // New notification form
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    targetUser: "all", // "all" or specific user ID
    type: "info", // "info", "warning", "success", "error"
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        setLoading(false)
        return
      }

      const response = await axios.get(`${url}/api/notification/all`, {
        headers: {
          token: token,
        },
      })

      if (response.data.success) {
        setNotifications(response.data.data)
      } else {
        setError(response.data.message || "Lỗi khi tải thông báo")
        toast.error(response.data.message || "Lỗi khi tải thông báo")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError("Lỗi kết nối đến máy chủ: " + (error.message || "Unknown error"))
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        return
      }

      const response = await axios.get(`${url}/api/user/list`, {
        headers: {
          token: token,
        },
      })

      if (response.data.success) {
        setUsers(response.data.data)
      } else {
        toast.error(response.data.message || "Lỗi khi tải danh sách người dùng")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Lỗi kết nối đến máy chủ khi tải danh sách người dùng")
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUsers()
  }, [])

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("Vui lòng nhập tiêu đề và nội dung thông báo")
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        return
      }

      const response = await axios.post(`${url}/api/notification/create`, newNotification, {
        headers: {
          token: token,
        },
      })

      if (response.data.success) {
        setNewNotification({
          title: "",
          message: "",
          targetUser: "all",
          type: "info",
        })
        toast.success("Đã gửi thông báo thành công")
        fetchNotifications()
      } else {
        toast.error(response.data.message || "Lỗi khi gửi thông báo")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Lỗi kết nối đến máy chủ khi gửi thông báo")
    }
  }

  const handleMarkNotificationRead = async (notificationId, isRead) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        return
      }

      const response = await axios.post(
        `${url}/api/notification/read`,
        {
          id: notificationId,
          read: isRead,
        },
        {
          headers: {
            token: token,
          },
        },
      )

      if (response.data.success) {
        const updatedNotifications = notifications.map((item) => {
          if (item._id === notificationId) {
            return {
              ...item,
              read: isRead,
            }
          }
          return item
        })
        setNotifications(updatedNotifications)
        toast.success(isRead ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc")
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật trạng thái thông báo")
      }
    } catch (error) {
      console.error("Error updating notification status:", error)
      toast.error("Lỗi kết nối đến máy chủ khi cập nhật trạng thái thông báo")
    }
  }

  const handleDeleteNotification = (notificationId) => {
    setConfirmModal({
      isOpen: true,
      id: notificationId,
      message: "Bạn có chắc chắn muốn xóa thông báo này?",
    })
  }

  const handleConfirmAction = async () => {
    const { id } = confirmModal
    const token = localStorage.getItem("token")

    if (!token) {
      toast.error("Vui lòng đăng nhập lại để tiếp tục")
      setConfirmModal({ isOpen: false, id: null, message: "" })
      return
    }

    try {
      const response = await axios.post(
        `${url}/api/notification/delete`,
        { id },
        {
          headers: {
            token: token,
          },
        },
      )

      if (response.data.success) {
        const updatedNotifications = notifications.filter((item) => item._id !== id)
        setNotifications(updatedNotifications)
        toast.success("Đã xóa thông báo thành công")
      } else {
        toast.error(response.data.message || "Lỗi khi xóa thông báo")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Lỗi kết nối đến máy chủ khi xóa thông báo")
    }

    setConfirmModal({ isOpen: false, id: null, message: "" })
  }

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

  const getNotificationTypeStyle = (type) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Get current page items for notifications
  const getCurrentNotifications = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return notifications.slice(indexOfFirstItem, indexOfLastItem)
  }

  const totalNotificationsPages = Math.ceil(notifications.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const currentNotifications = getCurrentNotifications()

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center">
          <Bell className="mr-2" size={24} />
          Quản lý thông báo
        </h1>

        {/* Create Notification Form */}
        <NotificationForm
          newNotification={newNotification}
          setNewNotification={setNewNotification}
          handleSendNotification={handleSendNotification}
          users={users}
        />

        {/* Notifications List */}
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Danh sách thông báo</h3>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
            <p className="font-medium">Lỗi:</p>
            <p>{error}</p>
          </div>
        ) : currentNotifications.length === 0 ? (
          <EmptyState type="notifications" />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                handleMarkNotificationRead={handleMarkNotificationRead}
                handleDeleteNotification={handleDeleteNotification}
                getNotificationTypeStyle={getNotificationTypeStyle}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalNotificationsPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalNotificationsPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null, message: "" })}
        onConfirm={handleConfirmAction}
        title={"Xóa thông báo"}
        message={confirmModal.message}
        confirmText={"Xóa"}
        confirmButtonClass={"bg-red-600 hover:bg-red-700"}
      />
    </div>
  )
}

export default Notifications
