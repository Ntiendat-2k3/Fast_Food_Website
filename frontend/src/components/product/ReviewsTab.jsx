"use client"

import { motion } from "framer-motion"
import ReviewsList from "./ReviewsList"
import ReviewForm from "../../components/ReviewForm"

const ReviewsTab = ({
  showReviewForm,
  foodItem,
  handleReviewSubmitted,
  setShowReviewForm,
  isCheckingEligibility,
  reviewEligibility,
  handleWriteReview,
  isLoadingReviews,
  reviews,
  token,
  user,
  editingCommentId,
  handleEditComment,
  handleSaveEdit,
  handleCancelEdit,
  url,
}) => {
  return (
    <div>
      {showReviewForm ? (
        <ReviewForm
          foodId={foodItem._id}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      ) : (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Đánh giá từ khách hàng</h3>

          {/* Debug info */}
          <div className="text-xs text-gray-500 mr-4">
            {isCheckingEligibility && "Đang kiểm tra..."}
            {reviewEligibility && (
              <span>
                Can: {reviewEligibility.canReview ? "✅" : "❌"} | Purchased:{" "}
                {reviewEligibility.hasPurchased ? "✅" : "❌"} | Reviewed: {reviewEligibility.hasReviewed ? "✅" : "❌"}
              </span>
            )}
          </div>

          {/* Luôn hiển thị nút Viết đánh giá */}
          <motion.button
            onClick={handleWriteReview}
            className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-2 px-4 rounded-lg font-semibold transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Viết đánh giá
          </motion.button>
        </div>
      )}

      <ReviewsList
        reviews={reviews}
        isLoadingReviews={isLoadingReviews}
        showReviewForm={showReviewForm}
        handleWriteReview={handleWriteReview}
        token={token}
        user={user}
        editingCommentId={editingCommentId}
        handleEditComment={handleEditComment}
        handleSaveEdit={handleSaveEdit}
        handleCancelEdit={handleCancelEdit}
        url={url}
      />
    </div>
  )
}

export default ReviewsTab
