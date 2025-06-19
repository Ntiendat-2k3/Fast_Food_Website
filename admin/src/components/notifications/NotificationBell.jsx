"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCheck } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

const NotificationBell = ({ url }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await axios.get(`${url}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        setNotifications(response.data.data)
        const unread = response.data.data.filter((n) => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await axios.patch(
        `${url}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await axios.patch(
        `${url}/api/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error("Lỗi khi đánh dấu thông báo")
    }
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return "Vừa xong"
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`
    } catch (error) {
      return "Không xác định"
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Setup polling for new notifications
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [url])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-dark-light rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white">Thông báo ({unreadCount})</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 flex items-center"
                  >
                    <CheckCheck size={14} className="mr-1" />
                    Đọc tất cả
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">{notification.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
