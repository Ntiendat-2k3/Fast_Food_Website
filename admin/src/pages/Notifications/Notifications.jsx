"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Bell, ShoppingCart, MessageSquare, Plus, Trash2, CheckSquare, Square } from "lucide-react"

// Import components
import ConfirmModal from "../../components/ConfirmModal"
import Pagination from "../../components/Pagination"
import NotificationForm from "../../components/comments/NotificationForm"
import EmptyState from "../../components/comments/EmptyState"

const Notifications = ({ url }) => {
  const [activeTab, setActiveTab] = useState("orders") // "orders" or "created"
  const [orderNotifications, setOrderNotifications] = useState([])
  const [createdNotifications, setCreatedNotifications] = useState([])
  const [groupedCreatedNotifications, setGroupedCreatedNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, message: "", type: "single" })
  const [newOrdersCount, setNewOrdersCount] = useState(0)

  // Selection states
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // New notification form
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    targetUser: "all",
    type: "info",
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const groupNotifications = (notificationsList) => {
    const grouped = {}

    notificationsList.forEach((notification) => {
      // Create a unique key based on title, message, type, and creation time (rounded to minute)
      const createdTime = new Date(notification.createdAt)
      const timeKey = `${createdTime.getFullYear()}-${createdTime.getMonth()}-${createdTime.getDate()}-${createdTime.getHours()}-${createdTime.getMinutes()}`
      const groupKey = `${notification.title}-${notification.message}-${notification.type}-${timeKey}`

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          ...notification,
          recipientCount: 1,
          recipients: [notification.userId],
          notificationIds: [notification._id],
        }
      } else {
        grouped[groupKey].recipientCount += 1
        grouped[groupKey].recipients.push(notification.userId)
        grouped[groupKey].notificationIds.push(notification._id)
      }
    })

    return Object.values(grouped).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

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

      const response = await axios.get(`${url}/api/notification/admin/list`, {
        headers: {
          token: token,
        },
      })

      if (response.data.success) {
        const allNotifications = response.data.data

        // Separate order notifications from created notifications
        const orderNots = allNotifications.filter(
          (notif) =>
            notif.title?.includes("Đơn hàng mới") ||
            notif.title?.includes("New Order") ||
            notif.message?.includes("đơn hàng") ||
            notif.message?.includes("order") ||
            notif.type === "order",
        )

        const createdNots = allNotifications.filter(
          (notif) =>
            !notif.title?.includes("Đơn hàng mới") &&
            !notif.title?.includes("New Order") &&
            !notif.message?.includes("đơn hàng") &&
            !notif.message?.includes("order") &&
            notif.type !== "order",
        )

        setOrderNotifications(orderNots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        setCreatedNotifications(createdNots)

        const grouped = groupNotifications(createdNots)
        setGroupedCreatedNotifications(grouped)

        // Count new orders (orders from last 24 hours that are unread)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const newOrders = orderNots.filter((notif) => new Date(notif.createdAt) > oneDayAgo && !notif.read)
        setNewOrdersCount(newOrders.length)

        // Reset selections when data changes
        setSelectedNotifications([])
        setSelectAll(false)
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

  const handleMarkOrderNotificationRead = async (notificationId, isRead) => {
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
        const updatedNotifications = orderNotifications.map((item) => {
          if (item._id === notificationId) {
            return {
              ...item,
              read: isRead,
            }
          }
          return item
        })
        setOrderNotifications(updatedNotifications)

        // Update new orders count
        if (isRead) {
          setNewOrdersCount((prev) => Math.max(0, prev - 1))
        } else {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          const notification = orderNotifications.find((n) => n._id === notificationId)
          if (notification && new Date(notification.createdAt) > oneDayAgo) {
            setNewOrdersCount((prev) => prev + 1)
          }
        }

        toast.success(isRead ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc")
      } else {
        toast.error(response.data.message || "Lỗi khi cập nhật trạng thái thông báo")
      }
    } catch (error) {
      console.error("Error updating notification status:", error)
      toast.error("Lỗi kết nối đến máy chủ khi cập nhật trạng thái thông báo")
    }
  }

  // Selection handlers
  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) => {
      if (prev.includes(notificationId)) {
        return prev.filter((id) => id !== notificationId)
      } else {
        return [...prev, notificationId]
      }
    })
  }

  const handleSelectAll = () => {
    const currentNotifications = getCurrentNotifications()
    if (selectAll) {
      setSelectedNotifications([])
    } else {
      if (activeTab === "orders") {
        setSelectedNotifications(currentNotifications.map((n) => n._id))
      } else {
        // For grouped notifications, select all notification IDs in the group
        const allIds = currentNotifications.flatMap((n) => n.notificationIds)
        setSelectedNotifications(allIds)
      }
    }
    setSelectAll(!selectAll)
  }

  // Delete handlers
  const handleDeleteOrderNotification = (notificationId) => {
    setConfirmModal({
      isOpen: true,
      id: [notificationId],
      message: "Bạn có chắc chắn muốn xóa thông báo đơn hàng này?",
      type: "single",
    })
  }

  const handleDeleteNotificationGroup = (groupedNotification) => {
    setConfirmModal({
      isOpen: true,
      id: groupedNotification.notificationIds,
      message: `Bạn có chắc chắn muốn xóa thông báo này? (${groupedNotification.recipientCount} người nhận)`,
      type: "single",
    })
  }

  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thông báo để xóa")
      return
    }

    setConfirmModal({
      isOpen: true,
      id: selectedNotifications,
      message: `Bạn có chắc chắn muốn xóa ${selectedNotifications.length} thông báo đã chọn?`,
      type: "multiple",
    })
  }

  const handleDeleteAll = () => {
    const currentTab = activeTab
    const count = currentTab === "orders" ? orderNotifications.length : groupedCreatedNotifications.length

    if (count === 0) {
      toast.error("Không có thông báo nào để xóa")
      return
    }

    setConfirmModal({
      isOpen: true,
      id: null,
      message: `Bạn có chắc chắn muốn xóa tất cả ${count} thông báo trong tab "${
        currentTab === "orders" ? "Thông báo đơn hàng" : "Thông báo đã tạo"
      }"?`,
      type: "all",
      tabType: currentTab,
    })
  }

  const handleConfirmAction = async () => {
    const { id: notificationIds, type, tabType } = confirmModal
    const token = localStorage.getItem("token")

    if (!token) {
      toast.error("Vui lòng đăng nhập lại để tiếp tục")
      setConfirmModal({ isOpen: false, id: null, message: "", type: "single" })
      return
    }

    try {
      if (type === "all") {
        // Delete all notifications of specific type
        const response = await axios.post(
          `${url}/api/notification/delete-all`,
          { type: tabType },
          {
            headers: {
              token: token,
            },
          },
        )

        if (response.data.success) {
          toast.success(`Đã xóa ${response.data.deletedCount} thông báo thành công`)
          fetchNotifications()
        } else {
          toast.error(response.data.message || "Lỗi khi xóa thông báo")
        }
      } else {
        // Delete single or multiple notifications
        const response = await axios.post(
          `${url}/api/notification/delete-multiple`,
          { ids: notificationIds },
          {
            headers: {
              token: token,
            },
          },
        )

        if (response.data.success) {
          toast.success(`Đã xóa ${response.data.deletedCount} thông báo thành công`)
          fetchNotifications()
          setSelectedNotifications([])
          setSelectAll(false)
        } else {
          toast.error(response.data.message || "Lỗi khi xóa thông báo")
        }
      }
    } catch (error) {
      console.error("Error deleting notifications:", error)
      toast.error("Lỗi kết nối đến máy chủ khi xóa thông báo")
    }

    setConfirmModal({ isOpen: false, id: null, message: "", type: "single" })
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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Helper function to get user name from userId
  const getUserName = (userId) => {
    if (!userId) return "Không xác định"

    // If userId is already a string (user name or email), return it
    if (typeof userId === "string") {
      return userId
    }

    // If userId is an object with user info, extract the name
    if (typeof userId === "object" && userId !== null) {
      return userId.name || userId.email || userId._id || "Không xác định"
    }

    // Find user in users list
    const user = users.find((u) => u._id === userId)
    return user ? user.name || user.email : userId
  }

  // Get current page items
  const getCurrentNotifications = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage

    if (activeTab === "orders") {
      return orderNotifications.slice(indexOfFirstItem, indexOfLastItem)
    } else {
      return groupedCreatedNotifications.slice(indexOfFirstItem, indexOfLastItem)
    }
  }

  const getTotalPages = () => {
    if (activeTab === "orders") {
      return Math.ceil(orderNotifications.length / itemsPerPage)
    } else {
      return Math.ceil(groupedCreatedNotifications.length / itemsPerPage)
    }
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    setSelectedNotifications([])
    setSelectAll(false)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSelectedNotifications([])
    setSelectAll(false)

    // Mark new orders as seen when switching to orders tab
    if (tab === "orders" && newOrdersCount > 0) {
      // Optional: You can implement auto-mark as read here
    }
  }

  const currentNotifications = getCurrentNotifications()
  const totalPages = getTotalPages()

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center">
          <Bell className="mr-2" size={24} />
          Quản lý thông báo
        </h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-600 dark:border-slate-600 mb-4 md:mb-6 overflow-x-auto bg-slate-800 rounded-t-xl">
          <button
            className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap transition-all duration-300 relative ${
              activeTab === "orders"
                ? "text-yellow-400 border-b-2 border-yellow-400 bg-slate-700"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => handleTabChange("orders")}
          >
            <ShoppingCart className="mr-2" size={16} />
            Thông báo đơn hàng
            {newOrdersCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                {newOrdersCount}
              </span>
            )}
          </button>
          <button
            className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap transition-all duration-300 ${
              activeTab === "created"
                ? "text-yellow-400 border-b-2 border-yellow-400 bg-slate-700"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
            onClick={() => handleTabChange("created")}
          >
            <MessageSquare className="mr-2" size={16} />
            Thông báo đã tạo
          </button>
        </div>

        {/* Create Notification Form - Only show in created tab */}
        {activeTab === "created" && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="text-green-600" size={20} />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Tạo thông báo mới</h3>
            </div>
            <NotificationForm
              newNotification={newNotification}
              setNewNotification={setNewNotification}
              handleSendNotification={handleSendNotification}
              users={users}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {!loading && !error && currentNotifications.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {selectAll ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectAll ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>

            {selectedNotifications.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Xóa đã chọn ({selectedNotifications.length})
              </button>
            )}

            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
            >
              <Trash2 size={16} />
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Notifications List */}
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          {activeTab === "orders"
            ? `Thông báo đơn hàng (${orderNotifications.length})`
            : `Thông báo đã tạo (${groupedCreatedNotifications.length})`}
        </h3>

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
            {activeTab === "orders"
              ? // Order notifications
                currentNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      !notification.read
                        ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 shadow-md"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    } ${selectedNotifications.includes(notification._id) ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification._id)}
                          onChange={() => handleSelectNotification(notification._id)}
                          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeStyle(notification.type || "order")}`}
                            >
                              Đơn hàng
                            </span>
                            {!notification.read && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Mới</span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>📅 {formatDate(notification.createdAt)}</span>
                            {notification.userId && <span>👤 Khách hàng: {getUserName(notification.userId)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleMarkOrderNotificationRead(notification._id, !notification.read)}
                          className={`p-2 rounded-lg transition-colors ${
                            notification.read
                              ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                              : "text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }`}
                          title={notification.read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                        >
                          {notification.read ? "👁️" : "👁️‍🗨️"}
                        </button>
                        <button
                          onClick={() => handleDeleteOrderNotification(notification._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Xóa thông báo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              : // Created notifications (grouped)
                currentNotifications.map((notification, index) => (
                  <div
                    key={`${notification._id}-${index}`}
                    className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${
                      notification.notificationIds.some((id) => selectedNotifications.includes(id))
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={notification.notificationIds.every((id) => selectedNotifications.includes(id))}
                          onChange={() => {
                            const allSelected = notification.notificationIds.every((id) =>
                              selectedNotifications.includes(id),
                            )
                            if (allSelected) {
                              setSelectedNotifications((prev) =>
                                prev.filter((id) => !notification.notificationIds.includes(id)),
                              )
                            } else {
                              setSelectedNotifications((prev) => [
                                ...prev.filter((id) => !notification.notificationIds.includes(id)),
                                ...notification.notificationIds,
                              ])
                            }
                          }}
                          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{notification.title}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeStyle(notification.type)}`}
                            >
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>📅 {formatDate(notification.createdAt)}</span>
                            <span>👥 {notification.recipientCount} người nhận</span>
                            {notification.createdBy && <span>👤 Tạo bởi: {notification.createdBy}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleDeleteNotificationGroup(notification)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Xóa thông báo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null, message: "", type: "single" })}
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
