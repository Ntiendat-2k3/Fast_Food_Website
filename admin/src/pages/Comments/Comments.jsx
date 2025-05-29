"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import {
  MessageSquare,
  Star,
  Check,
  X,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Tag,
  Bell,
  UserX,
  Send,
  Calendar,
  Reply,
  Eye,
  EyeOff,
  Shield,
  Edit,
} from "lucide-react"
import ConfirmModal from "../../components/ConfirmModal"
import Pagination from "../../components/Pagination"

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

      // Fetch notifications
      try {
        const notificationsResponse = await axios.get(`${url}/api/notification/all`, {
          headers: {
            token: token,
          },
        })

        if (notificationsResponse.data.success) {
          setNotifications(notificationsResponse.data.data)
        } else {
          console.error("API returned error:", notificationsResponse.data.message)
          toast.error(notificationsResponse.data.message || "Lỗi khi tải thông báo")
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast.error("Lỗi kết nối đến máy chủ khi tải thông báo")
      }
    } catch (error) {
      console.error("Error in fetchNotifications:", error)
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

      const response = await axios.post(`${url}/api/notification/create`, newNotification, {
        headers: {
          token: token,
        },
      })

      if (response.data.success) {
        // Add to local state for immediate feedback
        setNotifications([response.data.notification, ...notifications])

        // Reset form
        setNewNotification({
          title: "",
          message: "",
          targetUser: "all",
          type: "info",
        })

        toast.success("Đã gửi thông báo thành công")
        fetchNotifications()
      } else {
        console.error("API returned error:", response.data.message)
        toast.error(response.data.message || "Lỗi khi gửi thông báo")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Lỗi kết nối đến máy chủ khi gửi thông báo")
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
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6 overflow-x-auto">
          <button
            className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap ${
              activeTab === "comments"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("comments")}
          >
            <MessageSquare className="mr-2" size={16} />
            Đánh giá sản phẩm
          </button>
          <button
            className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap ${
              activeTab === "notifications"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="mr-2" size={16} />
            Thông báo
          </button>
          <button
            className={`py-3 px-3 md:px-4 font-medium text-sm flex items-center whitespace-nowrap ${
              activeTab === "blacklist"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("blacklist")}
          >
            <UserX className="mr-2" size={16} />
            Danh sách đen
          </button>
        </div>

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <>
            <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên người dùng, nội dung hoặc sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Category Filter */}
                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="pending">Chưa duyệt</option>
                  </select>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchComments}
                  className="p-2.5 bg-gray-100 dark:bg-dark-lighter rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark transition-colors w-full sm:w-auto"
                  title="Refresh"
                >
                  <RefreshCw size={20} className="mx-auto sm:mx-0" />
                </button>
              </div>
            </div>

            {/* Filter Summary */}
            {(categoryFilter !== "all" || statusFilter !== "all" || searchTerm) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-4 rounded-lg mb-6">
                <p className="font-medium">Bộ lọc hiện tại:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categoryFilter !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Danh mục: {categoryFilter}
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Trạng thái: {statusFilter === "approved" ? "Đã duyệt" : "Chưa duyệt"}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Tìm kiếm: {searchTerm}
                    </span>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
                <p className="font-medium">Lỗi:</p>
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredComments.length > 0 ? (
              <div className="space-y-4">
                {currentComments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`bg-white dark:bg-dark rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border ${
                      comment.isApproved
                        ? "border-green-200 dark:border-green-900"
                        : "border-yellow-200 dark:border-yellow-900"
                    } p-4`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between mb-4">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 ${
                            comment.isApproved
                              ? "bg-green-100 dark:bg-green-900/30 text-green-500"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500"
                          }`}
                        >
                          {comment.isApproved ? <Check size={18} /> : <X size={18} />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{comment.userName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!comment.isApproved && (
                          <button
                            onClick={() => handleStatusChange(comment._id, true)}
                            className="p-1.5 bg-green-100 text-green-500 rounded-full hover:bg-green-200 transition-colors"
                            title="Duyệt đánh giá"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {comment.isApproved && (
                          <button
                            onClick={() => handleStatusChange(comment._id, false)}
                            className="p-1.5 bg-yellow-100 text-yellow-500 rounded-full hover:bg-yellow-200 transition-colors"
                            title="Hủy duyệt"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(comment._id)}
                          className="p-1.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-lighter rounded-lg p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Đánh giá cho: {getFoodName(comment.foodId)}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                          {getFoodCategory(comment.foodId)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.comment}</p>

                      {/* Admin Reply Section */}
                      {comment.adminReply && comment.adminReply.message && replyForm.commentId !== comment._id ? (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                              <Reply size={12} className="mr-1" />
                              Phản hồi của quản trị viên:
                            </div>
                            <button
                              onClick={() =>
                                setReplyForm({ commentId: comment._id, message: comment.adminReply.message })
                              }
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Chỉnh sửa phản hồi"
                            >
                              <Edit size={12} />
                            </button>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-xs whitespace-pre-line">
                            {comment.adminReply.message}
                          </p>
                          {comment.adminReply.createdAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(comment.adminReply.createdAt)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3">
                          <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            <Reply size={12} className="mr-1" />
                            {replyForm.commentId === comment._id && comment.adminReply && comment.adminReply.message
                              ? "Chỉnh sửa phản hồi:"
                              : "Thêm phản hồi:"}
                          </div>
                          <textarea
                            placeholder="Nhập phản hồi của bạn..."
                            rows={2}
                            value={replyForm.commentId === comment._id ? replyForm.message : ""}
                            onChange={(e) => setReplyForm({ commentId: comment._id, message: e.target.value })}
                            onClick={() => {
                              if (replyForm.commentId !== comment._id) {
                                setReplyForm({
                                  commentId: comment._id,
                                  message: comment.adminReply?.message || "",
                                })
                              }
                            }}
                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                          />
                          <div className="flex justify-end mt-2 gap-2">
                            {replyForm.commentId === comment._id &&
                              comment.adminReply &&
                              comment.adminReply.message && (
                                <button
                                  onClick={() => setReplyForm({ commentId: null, message: "" })}
                                  className="px-2.5 py-1 rounded-lg text-xs flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                  Hủy
                                </button>
                              )}
                            <button
                              onClick={handleReplyToComment}
                              disabled={!replyForm.message || replyForm.commentId !== comment._id}
                              className={`px-2.5 py-1 rounded-lg text-xs flex items-center ${
                                !replyForm.message || replyForm.commentId !== comment._id
                                  ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                                  : "bg-primary text-white hover:bg-primary-dark"
                              }`}
                            >
                              <Send size={12} className="mr-1" />
                              {replyForm.commentId === comment._id && comment.adminReply && comment.adminReply.message
                                ? "Cập nhật"
                                : "Gửi phản hồi"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                <Pagination currentPage={currentPage} totalPages={totalCommentsPages} onPageChange={handlePageChange} />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-dark-lighter rounded-xl">
                <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">Không có đánh giá nào</h3>
                <p className="text-gray-400 dark:text-gray-500">Chưa có đánh giá nào phù hợp với tìm kiếm của bạn</p>
              </div>
            )}
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div>
            <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <Bell className="mr-2" size={20} />
                Quản lý thông báo
              </h2>

              {/* New Notification Form */}
              <div className="bg-gray-50 dark:bg-dark rounded-lg p-4 mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Tạo thông báo mới</h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="notification-title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Tiêu đề
                    </label>
                    <input
                      id="notification-title"
                      type="text"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      placeholder="Nhập tiêu đề thông báo"
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notification-message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nội dung
                    </label>
                    <textarea
                      id="notification-message"
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                      placeholder="Nhập nội dung thông báo"
                      rows={3}
                      className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="notification-target"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Đối tượng
                      </label>
                      <select
                        id="notification-target"
                        value={newNotification.targetUser}
                        onChange={(e) => setNewNotification({ ...newNotification, targetUser: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">Tất cả người dùng</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="notification-type"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Loại thông báo
                      </label>
                      <select
                        id="notification-type"
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="info">Thông tin</option>
                        <option value="warning">Cảnh báo</option>
                        <option value="success">Thành công</option>
                        <option value="error">Lỗi</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSendNotification}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                    >
                      <Send size={16} className="mr-2" />
                      Gửi thông báo
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Danh sách thông báo</h3>

              {notificationsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : currentNotifications.length > 0 ? (
                <div className="space-y-4">
                  {currentNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`border rounded-lg overflow-hidden ${notification.read ? "border-gray-200 dark:border-gray-700" : "border-primary dark:border-primary/70"}`}
                    >
                      <div
                        className={`px-4 py-3 flex justify-between items-center ${getNotificationTypeStyle(notification.type)}`}
                      >
                        <div className="font-medium">{notification.title}</div>
                        <div className="flex items-center space-x-1">
                          {notification.read ? (
                            <button
                              onClick={() => handleMarkNotificationRead(notification._id, false)}
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Đánh dấu chưa đọc"
                            >
                              <EyeOff size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkNotificationRead(notification._id, true)}
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Đánh dấu đã đọc"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Xóa thông báo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-dark">
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{notification.message}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(notification.createdAt)}
                          </div>
                          <div>{notification.targetUser === "all" ? "Tất cả người dùng" : "Người dùng cụ thể"}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalNotificationsPages > 1 && (
                    <Pagination
                      currentPage={notificationsPage}
                      totalPages={totalNotificationsPages}
                      onPageChange={handleNotificationsPageChange}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-dark rounded-lg">
                  <Bell size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Chưa có thông báo nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blacklist Tab */}
        {activeTab === "blacklist" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Block User Form */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
                    <UserX className="mr-2" size={20} />
                    Chặn người dùng
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="block-user"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Chọn người dùng
                      </label>
                      <select
                        id="block-user"
                        value={blockUserForm.userId}
                        onChange={handleUserSelect}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      >
                        <option value="">-- Chọn người dùng --</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                      {blockUserForm.userId && (
                        <p className="mt-1 text-xs text-green-600">
                          Đã chọn:{" "}
                          {users.find((u) => u._id === blockUserForm.userId)?.name || "Người dùng không xác định"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="block-reason"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Lý do chặn
                      </label>
                      <textarea
                        id="block-reason"
                        value={blockUserForm.reason}
                        onChange={(e) => setBlockUserForm({ ...blockUserForm, reason: e.target.value })}
                        placeholder="Nhập lý do chặn người dùng"
                        rows={3}
                        className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleBlockUser}
                        disabled={!blockUserForm.userId || !blockUserForm.reason}
                        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center text-sm ${
                          !blockUserForm.userId || !blockUserForm.reason
                            ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        <Shield size={16} className="mr-2" />
                        Chặn người dùng
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blacklist Table */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
                    <UserX className="mr-2" size={20} />
                    Danh sách người dùng bị chặn
                  </h2>

                  {blacklistLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : currentBlacklist.length > 0 ? (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th
                                scope="col"
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                              >
                                Người dùng
                              </th>
                              <th
                                scope="col"
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell"
                              >
                                Lý do
                              </th>
                              <th
                                scope="col"
                                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell"
                              >
                                Ngày chặn
                              </th>
                              <th
                                scope="col"
                                className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                              >
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentBlacklist.map((user) => (
                              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                      <span className="text-gray-700 dark:text-gray-200 font-medium">
                                        {user.userName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user.userName}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 hidden sm:table-cell">
                                  <div className="text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-2">
                                    {user.reason}
                                  </div>
                                </td>
                                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                  {formatDate(user.blockedAt)}
                                </td>
                                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                  <button
                                    onClick={() => handleUnblockUser(user._id)}
                                    className="text-primary hover:text-primary-dark"
                                  >
                                    Bỏ chặn
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalBlacklistPages > 1 && (
                        <div className="mt-4">
                          <Pagination
                            currentPage={blacklistPage}
                            totalPages={totalBlacklistPages}
                            onPageChange={handleBlacklistPageChange}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-dark rounded-lg">
                      <Shield size={40} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">Không có người dùng nào bị chặn</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, id: null, message: "" })}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.type === "deleteComment"
            ? "Xác nhận xóa đánh giá"
            : confirmModal.type === "deleteNotification"
              ? "Xác nhận xóa thông báo"
              : "Xác nhận bỏ chặn người dùng"
        }
        message={confirmModal.message}
      />
    </div>
  )
}

export default Comments
