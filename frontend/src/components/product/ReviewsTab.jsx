import { Star, MessageCircle, User, Calendar } from "lucide-react"
import { useReviews } from "../../hooks/useReviews"
import ReviewCommentForm from "../ReviewCommentForm"
import ReviewEligibilityNotice from "../ReviewEligibilityNotice"

const ReviewsTab = ({ foodItem }) => {
  const {
    showReviewForm,
    setShowReviewForm,
    reviews,
    ratingStats,
    isLoadingReviews,
    isLoadingStats,
    reviewEligibility,
    isCheckingEligibility,
    handleReviewSubmitted,
    handleWriteReview,
  } = useReviews(foodItem)

  console.log(reviews);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const renderRatingDistribution = () => {
    if (isLoadingStats || !ratingStats.totalReviews) return null

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingStats.ratingDistribution[star] || 0
          const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0

          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-gray-600">{star}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (isLoadingReviews || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{ratingStats.averageRating.toFixed(1)}</div>
            <div className="flex justify-center mb-2">{renderStars(Math.round(ratingStats.averageRating))}</div>
            <div className="text-gray-600">{ratingStats.totalReviews} đánh giá</div>
          </div>

          {/* Rating Distribution */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Phân bố đánh giá</h4>
            {renderRatingDistribution()}
          </div>
        </div>
      </div>

      {/* Review Form Section */}
      <div className="border-b pb-6">
        {isCheckingEligibility ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-600">Đang kiểm tra quyền đánh giá...</span>
          </div>
        ) : (
          <>
            {!showReviewForm ? (
              <div className="space-y-4">
                <ReviewEligibilityNotice eligibility={reviewEligibility} onWriteReview={handleWriteReview} />
              </div>
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
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Đánh giá từ khách hàng ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có đánh giá nào cho sản phẩm này</p>
            <p className="text-sm">Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{review.userName || "Khách hàng"}</span>
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(review.createdAt)}
                    </div>

                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                    {review.adminReply && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-blue-900">Phản hồi từ cửa hàng</span>
                        </div>
                        <p className="text-sm text-blue-800">{review.adminReply}</p>
                        {review.adminReplyAt && (
                          <div className="text-xs text-blue-600 mt-1">{formatDate(review.adminReplyAt)}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsTab
