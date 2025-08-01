"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { MessageSquare, Star, Check, X, Trash2, Reply, Edit, Send } from "lucide-react"

// Import components
import ConfirmModal from "../../components/ConfirmModal"
import Pagination from "../../components/Pagination"
import CommentFilters from "../../components/comments/CommentFilters"

const Comments = ({ url }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null, message: "" })
  const [foodList, setFoodList] = useState([])
  const [categories, setCategories] = useState([])

  // Reply to comment form
  const [replyForm, setReplyForm] = useState({
    commentId: null,
    message: "",
  })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
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

  useEffect(() => {
    fetchComments()
    fetchFoodList()
  }, [])

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

  const getFoodName = (foodId) => {
    const food = foodList.find((food) => food._id === foodId)
    return food ? food.name : "Sản phẩm không tồn tại"
  }

  const getFoodCategory = (foodId) => {
    const food = foodList.find((food) => food._id === foodId)
    return food ? food.category : ""
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const filteredComments = comments.filter((comment) => {
    // Filter by status
    if (statusFilter === "approved" && !comment.isApproved) return false
    if (statusFilter === "pending" && comment.isApproved) return false

    // Filter by category
    if (categoryFilter !== "all") {
      const foodCategory = comment.foodCategory || getFoodCategory(comment.foodId)
      if (foodCategory !== categoryFilter) return false
    }

    // Filter by search term
    if (searchTerm) {
      const foodName = comment.foodName || getFoodName(comment.foodId)
      return (
        comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comment.comment && comment.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        foodName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalCommentsPages = Math.ceil(filteredComments.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const currentComments = getCurrentComments()

  return (
    <div className="w-full min-h-screen bg-slate-900">
      <div className="bg-slate-800 md:rounded-2xl md:shadow-2xl p-3 md:p-6 mb-4 md:mb-8 border border-slate-700">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
          <Star className="mr-2 text-yellow-400" size={24} />
          Quản lý đánh giá sản phẩm
        </h1>

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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 text-red-300 p-4 rounded-lg">
            <p className="font-medium">Lỗi:</p>
            <p>{error}</p>
          </div>
        ) : currentComments.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Không có đánh giá nào</h3>
            <p className="text-slate-400">Chưa có đánh giá nào phù hợp với bộ lọc hiện tại</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentComments.map((comment) => (
              <div
                key={comment._id}
                className={`bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${
                  comment.isApproved ? "border-green-600/30" : "border-yellow-600/30"
                } p-4`}
              >
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 font-bold text-lg ${
                        comment.isApproved
                          ? "bg-gradient-to-br from-green-400 to-green-500 text-slate-900"
                          : "bg-gradient-to-br from-yellow-400 to-yellow-500 text-slate-900"
                      }`}
                    >
                      {getInitials(comment.userName)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{comment.userName}</p>
                      {comment.userEmail && <p className="text-xs text-slate-400">{comment.userEmail}</p>}
                      <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!comment.isApproved && (
                      <button
                        onClick={() => handleStatusChange(comment._id, true)}
                        className="p-1.5 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/30 transition-colors"
                        title="Duyệt đánh giá"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {comment.isApproved && (
                      <button
                        onClick={() => handleStatusChange(comment._id, false)}
                        className="p-1.5 bg-yellow-600/20 text-yellow-400 rounded-full hover:bg-yellow-600/30 transition-colors"
                        title="Hủy duyệt"
                      >
                        <X size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(comment._id)}
                      className="p-1.5 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/30 transition-colors"
                      title="Xóa đánh giá"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-500"}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-yellow-400">{comment.rating}/5 sao</span>
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      Đánh giá cho: {comment.foodName || getFoodName(comment.foodId)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-blue-600/20 text-blue-300 rounded-full">
                      {comment.foodCategory || getFoodCategory(comment.foodId)}
                    </span>
                  </div>

                  {comment.comment && comment.comment !== "Đánh giá sao" && (
                    <p className="text-slate-300 text-sm mb-3">{comment.comment}</p>
                  )}

                  {/* Admin Reply Section */}
                  {comment.adminReply && comment.adminReply.message && replyForm.commentId !== comment._id ? (
                    <div className="mt-3 bg-yellow-900/20 p-2.5 rounded-lg border border-yellow-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs font-medium text-yellow-300 mb-1">
                          <Reply size={12} className="mr-1" />
                          Phản hồi của quản trị viên:
                        </div>
                        <button
                          onClick={() => setReplyForm({ commentId: comment._id, message: comment.adminReply.message })}
                          className="p-1 text-yellow-400 hover:text-yellow-300"
                          title="Chỉnh sửa phản hồi"
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                      <p className="text-slate-300 text-xs whitespace-pre-line">{comment.adminReply.message}</p>
                      {comment.adminReply.createdAt && (
                        <p className="text-xs text-slate-400 mt-1">{formatDate(comment.adminReply.createdAt)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center text-xs font-medium text-slate-300 mb-1.5">
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
                        className="block w-full rounded-lg border border-slate-600 bg-slate-700 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xs"
                      />
                      <div className="flex justify-end mt-2 gap-2">
                        {replyForm.commentId === comment._id && comment.adminReply && comment.adminReply.message && (
                          <button
                            onClick={() => setReplyForm({ commentId: null, message: "" })}
                            className="px-2.5 py-1 rounded-lg text-xs flex items-center bg-slate-600 text-slate-300 hover:bg-slate-500"
                          >
                            Hủy
                          </button>
                        )}
                        <button
                          onClick={handleReplyToComment}
                          disabled={!replyForm.message || replyForm.commentId !== comment._id}
                          className={`px-2.5 py-1 rounded-lg text-xs flex items-center ${
                            !replyForm.message || replyForm.commentId !== comment._id
                              ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600"
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
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalCommentsPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalCommentsPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, id: null, message: "" })}
        onConfirm={handleConfirmAction}
        title="Xóa đánh giá"
        message={confirmModal.message}
        confirmText="Xóa"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default Comments
