"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { MessageSquare, Shield } from "lucide-react"

// Import components
import ConfirmModal from "../../components/ConfirmModal"
import Pagination from "../../components/Pagination"
import TabNavigation from "../../components/comments/TabNavigation"
import CommentFilters from "../../components/comments/CommentFilters"
import CommentCard from "../../components/comments/CommentCard"
import EmptyState from "../../components/comments/EmptyState"
import NotificationForm from "../../components/comments/NotificationForm"
import NotificationCard from "../../components/comments/NotificationCard"
import BlockUserForm from "../../components/comments/BlockUserForm"
import BlacklistTable from "../../components/comments/BlacklistTable"

const Comments = ({ url }) => {
  const [activeTab, setActiveTab] = useState("comments") // "comments", "notifications", or "blacklist"
  const [comments, setComments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [blacklistLoading, setBlacklistLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null, message: "" })
  const [foodList, setFoodList] = useState([])
  const [categories, setCategories] = useState([])
  const selectedUserRef = useRef(null)

  // New notification form
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    targetUser: "all", // "all" or specific user ID
    type: "info", // "info", "warning", "success", "error"
  })

  // New blacklist form
  const [blockUserForm, setBlockUserForm] = useState({
    userId: "",
    reason: "",
  })

  // Reply to comment form
  const [replyForm, setReplyForm] = useState({
    commentId: null,
    message: "",
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [notificationsPage, setNotificationsPage] = useState(1)
  const [blacklistPage, setBlacklistPage] = useState(1)
  const itemsPerPage = 10

  const fetchComments = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching comments from:", `${url}/api/comment/all`)
      const token = localStorage.getItem("token")

      if (!token) {
        console.log("No token found in localStorage")
        setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        setLoading(false)
        return
      }

      const response = await axios.get(`${url}/api/comment/all`, {
        headers: {
          token: token,
        },
      })

      console.log("Comments API response:", response.data)

      if (response.data.success) {
        setComments(response.data.data)
      } else {
        console.error("API returned error:", response.data.message)
        setError(response.data.message || "Lỗi khi tải danh sách đánh giá")
        toast.error(response.data.message || "Lỗi khi tải danh sách đánh giá")
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
      setError("Lỗi kết nối đến máy chủ: " + (error.message || "Unknown error"))
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  const fetchFoodList = async () => {
    try {
      console.log("Fetching food list from:", `${url}/api/food/list`)
      const response = await axios.get(`${url}/api/food/list`)
      console.log("Food list API response:", response.data)

      if (response.data.success) {
        setFoodList(response.data.data)

        // Extract unique categories from food list
        const uniqueCategories = [...new Set(response.data.data.map((food) => food.category))]
        setCategories(uniqueCategories.sort())
        console.log("Extracted categories:", uniqueCategories)
      } else {
        console.error("API returned error:", response.data.message)
        toast.error("Lỗi khi tải danh sách sản phẩm")
      }
    } catch (error) {
      console.error("Error fetching food list:", error)
      toast.error("Lỗi kết nối đến máy chủ khi tải danh sách sản phẩm")
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
        console.error("API returned error:", response.data.message)
        toast.error(response.data.message || "Lỗi khi tải danh sách người dùng")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Lỗi kết nối đến máy chủ khi tải danh sách người dùng")
    }
  }

  const fetchNotifications = async () => {
    setNotificationsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        setNotificationsLoading(false)
        return
      }

      console.log("Fetching notifications from:", `${url}/api/notification/all`)

      const notificationsResponse = await axios.get(`${url}/api/notification/all`, {
        headers: {
          token: token,
        },
      })

      console.log("Notifications API response:", notificationsResponse.data)

      if (notificationsResponse.data.success) {
        setNotifications(notificationsResponse.data.data)
      } else {
        console.error("API returned error:", notificationsResponse.data.message)
        toast.error(notificationsResponse.data.message || "Lỗi khi tải thông báo")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      if (error.response) {
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
        toast.error(`Lỗi ${error.response.status}: ${error.response.data?.message || "Lỗi kết nối đến máy chủ"}`)
      } else if (error.request) {
        console.error("Request error:", error.request)
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.")
      } else {
        console.error("Error:", error.message)
        toast.error("Lỗi không xác định: " + error.message)
      }
    } finally {
      setNotificationsLoading(false)
    }
  }

  const fetchBlacklist = async () => {
    setBlacklistLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        setBlacklistLoading(false)
        return
      }

      const response = await axios.get(`${url}/api/user/blacklist`, {
        headers: {
          token: token,
        },
      })

      if (response.data.success) {
        setBlacklist(response.data.data)
      } else {
        console.error("API returned error:", response.data.message)
        toast.error(response.data.message || "Lỗi khi tải danh sách đen")
      }
    } catch (error) {
      console.error("Error fetching blacklist:", error)
      toast.error("Lỗi kết nối đến máy chủ khi tải danh sách đen")
    } finally {
      setBlacklistLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
    fetchFoodList()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications()
    } else if (activeTab === "blacklist") {
      fetchBlacklist()
    }
  }, [activeTab])

  const handleStatusChange = async (commentId, isApproved) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        return
      }

      console.log("Updating comment status:", { id: commentId, isApproved })
      const response = await axios.post(
        `${url}/api/comment/status`,
        {
          id: commentId,
          isApproved,
        },
        {
          headers: {
            token: token,
          },
        },
      )

      console.log("Status update response:", response.data)

      if (response.data.success) {
        toast.success("Cập nhật trạng thái đánh giá thành công")
        fetchComments()
      } else {
        console.error("API returned error:", response.data.message)
        toast.error(response.data.message || "Lỗi khi cập nhật trạng thái đánh giá")
      }
    } catch (error) {
      console.error("Error updating comment status:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    }
  }

  const handleDeleteClick = (commentId) => {
    setConfirmModal({
      isOpen: true,
      type: "deleteComment",
      id: commentId,
      message: "Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.",
    })
  }

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

      console.log("Sending notification:", newNotification)

      const response = await axios.post(`${url}/api/notification/create`, newNotification, {
        headers: {
          token: token,
        },
      })

      console.log("Create notification response:", response.data)

      if (response.data.success) {
        // Reset form
        setNewNotification({
          title: "",
          message: "",
          targetUser: "all",
          type: "info",
        })

        toast.success("Đã gửi thông báo thành công")
        fetchNotifications() // Refresh danh sách
      } else {
        console.error("API returned error:", response.data.message)
        toast.error(response.data.message || "Lỗi khi gửi thông báo")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      if (error.response) {
        toast.error(`Lỗi ${error.response.status}: ${error.response.data?.message || "Lỗi kết nối đến máy chủ"}`)
      } else {
        toast.error("Lỗi kết nối đến máy chủ khi gửi thông báo")
      }
    }
  }

  const handleReplyToComment = async () => {
    if (!replyForm.message || !replyForm.commentId) {
      toast.error("Vui lòng nhập nội dung phản hồi")
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        return
      }

      console.log("Sending reply:", { id: replyForm.commentId, message: replyForm.message })

      const response = await axios.post(
        `${url}/api/comment/reply`,
        {
          id: replyForm.commentId,
          message: replyForm.message,
        },
        {
          headers: {
            token: token,
          },
        },
      )

      if (response.data.success) {
        // Update local state for immediate feedback
        const updatedComments = comments.map((item) => {
          if (item._id === replyForm.commentId) {
            return {
              ...item,
              adminReply: {
                message: replyForm.message,
                createdAt: new Date(),
              },
            }
          }
          return item
        })

        setComments(updatedComments)

        // Reset form
        setReplyForm({
          commentId: null,
          message: "",
        })

        toast.success("Đã gửi phản hồi thành công")
        fetchComments()
      } else {
        console.error("API returned error:", response.data.message)
        toast.error(response.data.message || "Lỗi khi gửi phản hồi")
      }
    } catch (error) {
      console.error("Error replying to comment:", error)
      toast.error("Lỗi kết nối đến máy chủ khi gửi phản hồi")
    }
  }

  const handleBlockUser = async () => {
    if (!blockUserForm.userId || !blockUserForm.reason) {
      toast.error("Vui lòng chọn người dùng và nhập lý do chặn")
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập lại để tiếp tục")
        return
      }

      // Find the selected user to display in confirmation
      const selectedUser = users.find((user) => user._id === blockUserForm.userId)
      if (!selectedUser) {
        toast.error("Người dùng không hợp lệ, vui lòng chọn lại")
        return
      }

      console.log("Blocking user:", selectedUser.name, selectedUser._id)
      console.log("Block user form data:", blockUserForm)

      // Create a new object for the request to ensure we're not sending any extra data
      const blockData = {
        userId: blockUserForm.userId,
        reason: blockUserForm.reason,
      }

      const response = await axios.post(`${url}/api/user/block`, blockData, {
        headers: {
          token: token,
        },
      })

      if (response.data.success) {
        toast.success(`Đã chặn người dùng ${selectedUser.name} thành công`)

        // Reset form
        setBlockUserForm({
          userId: "",
          reason: "",
        })

        // Refresh blacklist
        fetchBlacklist()
      } else {
        console.error("API returned error:", response.data.message)
        toast.error(response.data.message || "Lỗi khi chặn người dùng")
      }
    } catch (error) {
      console.error("Error blocking user:", error)
      toast.error("Lỗi kết nối đến máy chủ khi chặn người dùng")
    }
  }

  const handleUnblockUser = (blacklistId) => {
    setConfirmModal({
      isOpen: true,
      type: "unblockUser",
      id: blacklistId,
      message: "Bạn có chắc chắn muốn bỏ chặn người dùng này?",
    })
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
        // Update local state for immediate feedback
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
        console.error("API returned error:", response.data.message)
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
      type: "deleteNotification",
      id: notificationId,
      message: "Bạn có chắc chắn muốn xóa thông báo này?",
    })
  }

  const handleConfirmAction = async () => {
    const { type, id } = confirmModal
    const token = localStorage.getItem("token")

    if (!token) {
      toast.error("Vui lòng đăng nhập lại để tiếp tục")
      setConfirmModal({ isOpen: false, type: null, id: null, message: "" })
      return
    }

    if (type === "deleteComment") {
      try {
        const response = await axios.post(
          `${url}/api/comment/delete`,
          { id },
          {
            headers: {
              token: token,
            },
          },
        )

        if (response.data.success) {
          toast.success("Xóa đánh giá thành công")
          fetchComments()
        } else {
          console.error("API returned error:", response.data.message)
          toast.error(response.data.message || "Lỗi khi xóa đánh giá")
        }
      } catch (error) {
        console.error("Error deleting comment:", error)
        toast.error("Lỗi kết nối đến máy chủ")
      }
    } else if (type === "deleteNotification") {
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
          // Update local state
          const updatedNotifications = notifications.filter((item) => item._id !== id)
          setNotifications(updatedNotifications)
          toast.success("Đã xóa thông báo thành công")
        } else {
          console.error("API returned error:", response.data.message)
          toast.error(response.data.message || "Lỗi khi xóa thông báo")
        }
      } catch (error) {
        console.error("Error deleting notification:", error)
        toast.error("Lỗi kết nối đến máy chủ khi xóa thông báo")
      }
    } else if (type === "unblockUser") {
      try {
        const response = await axios.post(
          `${url}/api/user/unblock`,
          { blacklistId: id },
          {
            headers: {
              token: token,
            },
          },
        )

        if (response.data.success) {
          // Update local state
          const updatedBlacklist = blacklist.filter((item) => item._id !== id)
          setBlacklist(updatedBlacklist)
          toast.success("Đã bỏ chặn người dùng thành công")
        } else {
          console.error("API returned error:", response.data.message)
          toast.error(response.data.message || "Lỗi khi bỏ chặn người dùng")
        }
      } catch (error) {
        console.error("Error unblocking user:", error)
        toast.error("Lỗi kết nối đến máy chủ khi bỏ chặn người dùng")
      }
    }

    setConfirmModal({ isOpen: false, type: null, id: null, message: "" })
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getFoodName = (foodId) => {
    const food = foodList.find((food) => food._id === foodId)
    return food ? food.name : "Sản phẩm không tồn tại"
  }

  const getFoodCategory = (foodId) => {
    const food = foodList.find((food) => food._id === foodId)
    return food ? food.category : ""
  }

  const filteredComments = comments.filter((comment) => {
    // Filter by status
    if (statusFilter === "approved" && !comment.isApproved) return false
    if (statusFilter === "pending" && comment.isApproved) return false

    // Filter by category
    if (categoryFilter !== "all") {
      const foodCategory = getFoodCategory(comment.foodId)
      if (foodCategory !== categoryFilter) return false
    }

    // Filter by search term
    if (searchTerm) {
      const foodName = getFoodName(comment.foodId).toLowerCase()
      return (
        comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        foodName.includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  // Get current page items for comments
  const getCurrentComments = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredComments.slice(indexOfFirstItem, indexOfLastItem)
  }

  // Get current page items for notifications
  const getCurrentNotifications = () => {
    const indexOfLastItem = notificationsPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return notifications.slice(indexOfFirstItem, indexOfLastItem)
  }

  // Get current page items for blacklist
  const getCurrentBlacklist = () => {
    const indexOfLastItem = blacklistPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return blacklist.slice(indexOfFirstItem, indexOfLastItem)
  }

  const totalCommentsPages = Math.ceil(filteredComments.length / itemsPerPage)
  const totalNotificationsPages = Math.ceil(notifications.length / itemsPerPage)
  const totalBlacklistPages = Math.ceil(blacklist.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleNotificationsPageChange = (pageNumber) => {
    setNotificationsPage(pageNumber)
  }

  const handleBlacklistPageChange = (pageNumber) => {
    setBlacklistPage(pageNumber)
  }

  const currentComments = getCurrentComments()
  const currentNotifications = getCurrentNotifications()
  const currentBlacklist = getCurrentBlacklist()

  // Get notification type style
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

  // Handle user selection for blacklist
  const handleUserSelect = (e) => {
    const userId = e.target.value
    console.log("User selected:", userId)
    selectedUserRef.current = userId
    setBlockUserForm({ ...blockUserForm, userId })
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6 flex items-center">
          <MessageSquare className="mr-2" size={24} />
          Quản lý người dùng
        </h1>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div>
            {/* Filters */}
            <CommentFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categories={categories}
              fetchComments={fetchComments}
            />

            {/* Comments List */}
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
                <p className="font-medium">Lỗi:</p>
                <p>{error}</p>
              </div>
            ) : currentComments.length === 0 ? (
              <EmptyState type="comments" />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {currentComments.map((comment) => (
                  <CommentCard
                    key={comment._id}
                    comment={comment}
                    handleStatusChange={handleStatusChange}
                    handleDeleteClick={handleDeleteClick}
                    handleReplyToComment={handleReplyToComment}
                    replyForm={replyForm}
                    setReplyForm={setReplyForm}
                    formatDate={formatDate}
                    getFoodName={getFoodName}
                    getFoodCategory={getFoodCategory}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalCommentsPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={currentPage} totalPages={totalCommentsPages} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div>
            {/* Create Notification Form */}
            <NotificationForm
              newNotification={newNotification}
              setNewNotification={setNewNotification}
              handleSendNotification={handleSendNotification}
              users={users}
            />

            {/* Notifications List */}
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Danh sách thông báo</h3>

            {notificationsLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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
            {!notificationsLoading && totalNotificationsPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={notificationsPage}
                  totalPages={totalNotificationsPages}
                  onPageChange={handleNotificationsPageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* Blacklist Tab */}
        {activeTab === "blacklist" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Block User Form */}
            <div className="lg:col-span-1">
              <BlockUserForm
                blockUserForm={blockUserForm}
                setBlockUserForm={setBlockUserForm}
                handleBlockUser={handleBlockUser}
                users={users}
                handleUserSelect={handleUserSelect}
              />
            </div>

            {/* Blacklist Table */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
                  <Shield className="mr-2" size={20} />
                  Danh sách người dùng bị chặn
                </h2>

                <BlacklistTable
                  blacklistLoading={blacklistLoading}
                  currentBlacklist={currentBlacklist}
                  handleUnblockUser={handleUnblockUser}
                  formatDate={formatDate}
                  blacklistPage={blacklistPage}
                  totalBlacklistPages={totalBlacklistPages}
                  handleBlacklistPageChange={handleBlacklistPageChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, id: null, message: "" })}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.type === "deleteComment"
            ? "Xóa đánh giá"
            : confirmModal.type === "deleteNotification"
              ? "Xóa thông báo"
              : "Bỏ chặn người dùng"
        }
        message={confirmModal.message}
        confirmText={
          confirmModal.type === "deleteComment" || confirmModal.type === "deleteNotification" ? "Xóa" : "Bỏ chặn"
        }
        confirmButtonClass={
          confirmModal.type === "deleteComment" || confirmModal.type === "deleteNotification"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-primary hover:bg-primary-dark"
        }
      />
    </div>
  )
}

export default Comments
