import { Star, MessageCircle, User, Calendar, Reply, Edit, Trash2 } from 'lucide-react'
import { useState, useContext } from 'react'
import { useReviews } from "../../hooks/useReviews"
import ReviewCommentForm from "../ReviewCommentForm"
import ReviewEligibilityNotice from "../ReviewEligibilityNotice"
import EditCommentForm from "../EditCommentForm"
import { StoreContext } from "../../context/StoreContext"
import { toast } from "react-toastify"
import axios from "axios"

const ReviewsTab = ({ foodItem }) => {
  const { url, token } = useContext(StoreContext)
  const [editingReview, setEditingReview] = useState(null)

  const {
    showReviewForm,
    setShowReviewForm,
    reviews,
    setReviews,
    ratingStats,
    isLoadingReviews,
    isLoadingStats,
    reviewEligibility,
    isCheckingEligibility,
    handleReviewSubmitted,
    handleWriteReview,
  } = useReviews(foodItem)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-600"}`} />
    ))
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
  }

  const handleSaveEdit = (updatedReview) => {
    // Update the review in the list
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review._id === updatedReview._id ? updatedReview : review
      )
    )
    setEditingReview(null)
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return
    }

    try {
      const response = await axios.delete(`${url}/api/comment/user/${reviewId}`, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success("Xóa đánh giá thành công")
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId))
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi xóa đánh giá")
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      toast.error("Có lỗi xảy ra khi xóa đánh giá")
    }
  }

  const renderRatingDistribution = () => {
    if (isLoadingStats || !ratingStats.totalReviews) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingStats.ratingDistribution[star] || 0
          const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0

          return (
            <div key={star} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="w-3 text-yellow-400">{star}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-300">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoadingReviews || isLoadingStats) {
    return (
      <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-gray-200 bg-gray-900 p-6 rounded-lg">
      {/* Rating Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {ratingStats.averageRating ? ratingStats.averageRating.toFixed(1) : "0.0"}
            </div>
            <div className="flex justify-center mb-2">{renderStars(Math.round(ratingStats.averageRating || 0))}</div>
            <div className="text-gray-300">{ratingStats.totalReviews || 0} đánh giá</div>
          </div>
          <div>
            <h4 className="font-medium text-yellow-300 mb-3">Phân bố đánh giá</h4>
            {ratingStats.totalReviews > 0 ? (
              renderRatingDistribution()
            ) : (
              <div className="text-gray-400 text-sm">Chưa có đánh giá nào</div>
            )}
          </div>
        </div>
      </div>

      {/* Review Form Section */}
      <div className="border-b border-gray-600 pb-6">
        {isCheckingEligibility ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
            <span className="ml-2 text-gray-400">Đang kiểm tra quyền đánh giá...</span>
          </div>
        ) : (
          <>
            {!showReviewForm ? (
              <ReviewEligibilityNotice eligibility={reviewEligibility} onWriteReview={handleWriteReview} />
            ) : (
              <ReviewCommentForm
                foodItem={foodItem}
                onSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            )}
          </>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Đánh giá từ khách hàng ({reviews.length})
        </h3>

        {isLoadingReviews ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">Chưa có đánh giá nào cho sản phẩm này</p>
            <p className="text-sm text-gray-500">Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                {editingReview && editingReview._id === review._id ? (
                  <EditCommentForm
                    comment={editingReview}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    url={url}
                    token={token}
                  />
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-yellow-300">{review.userName || "Khách hàng"}</span>
                            <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                          </div>

                          {/* Action buttons for user's own review */}
                          {token && reviewEligibility?.existingReview?._id === review._id && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Chỉnh sửa đánh giá"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                title="Xóa đánh giá"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(review.createdAt)}
                          {review.updatedAt && review.updatedAt !== review.createdAt && (
                            <span className="text-xs text-gray-500">(đã chỉnh sửa)</span>
                          )}
                        </div>

                        <p className="text-gray-100 leading-relaxed mb-3">{review.comment}</p>

                        {/* Admin Reply */}
                        {review.adminReply && (
                          <div className="border-l-4 border-blue-400 bg-blue-900/20 p-4 mt-4 rounded-r-lg">
                            <div className="flex items-center mb-2">
                              <Reply className="w-4 h-4 mr-2 text-blue-400" />
                              <span className="text-sm font-medium text-blue-300">Phản hồi từ cửa hàng</span>
                              {review.adminReplyAt && (
                                <span className="text-xs ml-2 text-blue-400">
                                  • {formatDate(review.adminReplyAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-blue-100 leading-relaxed">{review.adminReply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsTab
