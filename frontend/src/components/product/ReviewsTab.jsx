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
  ratingStats,
  isLoadingStats,
  reviews,
  isLoadingReviews,
  token,
  user,
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
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Đánh giá sản phẩm</h3>
            <p className="text-gray-400">Chia sẻ trải nghiệm của bạn với sản phẩm này</p>
          </div>

          {/* Nút đánh giá */}
          {token && (
            <motion.button
              onClick={handleWriteReview}
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-primary/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {reviewEligibility?.hasReviewed ? "Đã đánh giá" : "Viết đánh giá"}
            </motion.button>
          )}
        </div>
      )}

      <ReviewsList
        reviews={reviews}
        ratingStats={ratingStats}
        isLoadingReviews={isLoadingReviews}
        isLoadingStats={isLoadingStats}
        showReviewForm={showReviewForm}
        handleWriteReview={handleWriteReview}
        token={token}
        user={user}
        url={url}
      />
    </div>
  )
}

export default ReviewsTab
