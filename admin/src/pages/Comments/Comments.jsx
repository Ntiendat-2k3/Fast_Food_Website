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
// Removed NotificationForm and NotificationCard imports
import BlockUserForm from "../../components/comments/BlockUserForm"
import BlacklistTable from "../../components/comments/BlacklistTable"

const Comments = ({ url }) => {
  const [activeTab, setActiveTab] = useState("comments") // "comments" or "blacklist"
  const [comments, setComments] = useState([])
  // Removed notifications state
  const [blacklist, setBlacklist] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  // Removed notificationsLoading state
  const [blacklistLoading, setBlacklistLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null, message: "" })
  const [foodList, setFoodList] = useState([])
  const [categories, setCategories] = useState([])
  const selectedUserRef = useRef(null)

  // Removed newNotification form

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
  // Removed notificationsPage state
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

  // Removed fetchNotifications

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
    if (activeTab === "blacklist") {
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

  // Removed handleSendNotification

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

  // Removed handleMarkNotificationRead
  // Removed handleDeleteNotification

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
    // Removed else if (type === "deleteNotification")

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

  // Removed getCurrentNotifications

  // Get current page items for blacklist
  const getCurrentBlacklist = () => {
    const indexOfLastItem = blacklistPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return blacklist.slice(indexOfFirstItem, indexOfLastItem)
  }

  const totalCommentsPages = Math.ceil(filteredComments.length / itemsPerPage)
  // Removed totalNotificationsPages
  const totalBlacklistPages = Math.ceil(blacklist.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Removed handleNotificationsPageChange

  const handleBlacklistPageChange = (pageNumber) => {
    setBlacklistPage(pageNumber)
  }

  const currentComments = getCurrentComments()
  // Removed currentNotifications
  const currentBlacklist = getCurrentBlacklist()

  // Removed getNotificationTypeStyle

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
          confirmModal.type === "deleteComment" ? "Xóa đánh giá" : "Bỏ chặn người dùng" // Removed deleteNotification case
        }
        message={confirmModal.message}
        confirmText={
          confirmModal.type === "deleteComment" ? "Xóa" : "Bỏ chặn" // Removed deleteNotification case
        }
        confirmButtonClass={
          confirmModal.type === "deleteComment" ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"
        }
      />
    </div>
  )
}

export default Comments
