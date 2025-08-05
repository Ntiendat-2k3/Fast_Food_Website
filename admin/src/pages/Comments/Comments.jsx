"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { MessageSquare, Star, Trash2, User, Calendar, Search, RefreshCw } from "lucide-react"

// Import components
import ConfirmModal from "../../components/ConfirmModal"
import Pagination from "../../components/Pagination"

const Comments = ({ url }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null, message: "" })
  const [foodList, setFoodList] = useState([])

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

  const handleDeleteClick = (commentId) => {
    setConfirmModal({
      isOpen: true,
      type: "deleteComment",
      id: commentId,
      message: "Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.",
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
    if (searchTerm) {
      const foodName = getFoodName(comment.foodId)
      return (
        comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comment.comment && comment.comment.toLowerCase().includes(searchTerm.toLowerCase())) ||
        foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comment.userEmail && comment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <Star className="mr-2 text-yellow-400" size={24} />
            Quản lý đánh giá sản phẩm
          </h1>
          <button
            onClick={fetchComments}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Làm mới
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên người dùng, email, nội dung đánh giá hoặc tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="text-yellow-400 mr-3" size={24} />
              <div>
                <p className="text-slate-400 text-sm">Tổng đánh giá</p>
                <p className="text-white text-xl font-bold">{comments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-3" size={24} />
              <div>
                <p className="text-slate-400 text-sm">Đánh giá trung bình</p>
                <p className="text-white text-xl font-bold">
                  {comments.length > 0
                    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
                    : "0.0"}{" "}
                  / 5
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center">
              <User className="text-yellow-400 mr-3" size={24} />
              <div>
                <p className="text-slate-400 text-sm">Kết quả tìm kiếm</p>
                <p className="text-white text-xl font-bold">{filteredComments.length}</p>
              </div>
            </div>
          </div>
        </div>

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
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm ? "Không tìm thấy đánh giá nào" : "Chưa có đánh giá nào"}
            </h3>
            <p className="text-slate-400">
              {searchTerm ? "Thử thay đổi từ khóa tìm kiếm" : "Chưa có đánh giá nào từ khách hàng"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentComments.map((comment) => (
              <div
                key={comment._id}
                className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 font-bold text-lg bg-gradient-to-br from-yellow-400 to-yellow-500 text-slate-900">
                      {getInitials(comment.userName)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{comment.userName}</p>
                      {comment.userEmail && <p className="text-xs text-slate-400">{comment.userEmail}</p>}
                      <div className="flex items-center mt-1">
                        <Calendar className="text-slate-400 mr-1" size={12} />
                        <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteClick(comment._id)}
                      className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/30 transition-colors"
                      title="Xóa đánh giá"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-500"}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-yellow-400">{comment.rating}/5 sao</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-300">
                        Sản phẩm: {getFoodName(comment.foodId)}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full">
                        {getFoodCategory(comment.foodId)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-600/30 rounded-lg p-3">
                    <p className="text-slate-300 text-sm leading-relaxed">{comment.comment}</p>
                  </div>
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
