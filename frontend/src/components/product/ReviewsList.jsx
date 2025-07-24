"use client"

import { motion } from "framer-motion"
import { Star, User } from "lucide-react"

const ReviewsList = ({
  reviews,
  ratingStats,
  isLoadingReviews,
  isLoadingStats,
  showReviewForm,
  handleWriteReview,
  token,
}) => {
  if (isLoadingReviews || isLoadingStats) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Hiển thị thống kê rating nếu có đánh giá
  if (ratingStats && ratingStats.totalReviews > 0) {
    return (
      <div className="space-y-8">
        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-400 mb-3">{ratingStats.averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className={`${
                      star <= Math.round(ratingStats.averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-500"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-300 text-lg font-medium">{ratingStats.totalReviews} đánh giá</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-gray-300">{rating}</span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ratingStats.totalReviews > 0
                            ? (ratingStats.ratingDistribution[rating] / ratingStats.totalReviews) * 100
                            : 0
                        }%`,
                      }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-8 text-right">{ratingStats.ratingDistribution[rating]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reviews List */}
        {reviews && reviews.length > 0 && (
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-white">Đánh giá từ khách hàng</h4>
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-slate-900" />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-white text-lg">{review.userName || "Khách hàng"}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${
                                  star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-yellow-400 font-medium">{review.rating}/5</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Rating Description */}
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-slate-700 rounded-full text-sm text-gray-300">
                        {review.rating === 5 && "Rất hài lòng"}
                        {review.rating === 4 && "Hài lòng"}
                        {review.rating === 3 && "Bình thường"}
                        {review.rating === 2 && "Không hài lòng"}
                        {review.rating === 1 && "Rất không hài lòng"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Empty state khi chưa có đánh giá
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 bg-slate-800/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-600"
    >
      <div className="mb-6">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} className="text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-400 mb-6">Hãy là người đầu tiên chia sẻ trải nghiệm của bạn về sản phẩm này</p>
      </div>

      {token && (
        <motion.button
          onClick={handleWriteReview}
          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-4 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-primary/20"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star size={20} className="inline mr-2" />
          Viết đánh giá đầu tiên
        </motion.button>
      )}
    </motion.div>
  )
}

export default ReviewsList
