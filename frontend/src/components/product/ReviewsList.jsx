"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import ReviewItem from "./ReviewItem"

const ReviewsList = ({
  reviews,
  isLoadingReviews,
  showReviewForm,
  handleWriteReview,
  token,
  user,
  editingRatingId,
  handleEditRating,
  handleSaveEdit,
  handleCancelEdit,
  url,
}) => {
  if (isLoadingReviews) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-600 rounded-xl">
        <div className="mb-4">
          <Star size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Chưa có đánh giá nào cho sản phẩm này</p>
        </div>
        <motion.button
          onClick={handleWriteReview}
          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-6 rounded-xl font-semibold transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Hãy là người đầu tiên đánh giá
        </motion.button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <ReviewItem
          key={review._id}
          review={review}
          index={index}
          token={token}
          user={user}
          editingRatingId={editingRatingId}
          handleEditRating={handleEditRating}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          url={url}
        />
      ))}
    </div>
  )
}

export default ReviewsList
