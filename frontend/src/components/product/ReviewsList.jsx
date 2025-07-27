"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, User, MessageCircle, ChevronDown, ChevronUp, StarIcon } from "lucide-react"

const ReviewsList = ({
  foodId,
  url,
  refreshTrigger,
  token,
  handleWriteReview,
  handleWriteComment,
  userEligibility,
}) => {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    if (foodId) {
      fetchReviews()
      fetchStats()
    }
  }, [foodId, refreshTrigger])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${url}/api/comment/food/${foodId}`)
      const data = await response.json()

      if (data.success) {
        // Sort reviews to show ratings first, then comments
        const sortedReviews = data.data.sort((a, b) => {
          // If one has rating and other doesn't, prioritize the one with rating
          if (a.rating && !b.rating) return -1
          if (!a.rating && b.rating) return 1
          // If both have ratings or both don't have ratings, sort by date
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        setReviews(sortedReviews)
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviews([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${url}/api/comment/food/${foodId}/stats`)
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`} />
    ))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const isRatingReview = (review) => {
    return review.type === "rating" || (review.rating && review.rating > 0)
  }

  const isCommentOnly = (review) => {
    return review.type === "comment" || (!review.rating && review.comment && review.comment !== "Đánh giá sao")
  }

  if (loading) {
    return (
      <div className="space-y-6 bg-slate-900 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-4">
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/6"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!reviews.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-2xl p-8 border border-slate-700"
      >
        <div className="text-center py-12 border-2 border-dashed border-slate-600 rounded-xl">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Chưa có đánh giá hoặc bình luận nào</h3>
          <p className="text-slate-400 mb-6">Hãy là người đầu tiên chia sẻ trải nghiệm của bạn về sản phẩm này</p>
        </div>
      </motion.div>
    )
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5)
  const ratingsCount = reviews.filter((review) => isRatingReview(review)).length
  const commentsCount = reviews.filter((review) => isCommentOnly(review)).length

  return (
    <div className="space-y-6 bg-slate-900 rounded-2xl p-6 border border-slate-700">
      {/* Rating Statistics */}
      {stats && stats.totalReviews > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-400 mb-3">{stats.averageRating}</div>
              <div className="flex justify-center mb-3">{renderStars(Math.round(stats.averageRating))}</div>
              <div className="text-slate-300 text-lg font-medium">{stats.totalReviews} đánh giá</div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-sm text-slate-300">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          stats.totalReviews > 0 ? (stats.ratingDistribution[star] / stats.totalReviews) * 100 : 0
                        }%`,
                      }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-8 text-right">{stats.ratingDistribution[star]}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-yellow-400" />
            Đánh giá & Bình luận ({reviews.length})
          </h3>
          <div className="flex gap-4 text-sm text-slate-400">
            {ratingsCount > 0 && (
              <span className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                {ratingsCount} đánh giá
              </span>
            )}
            {commentsCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                {commentsCount} bình luận
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reviews and Comments List */}
      <div className="space-y-4">
        {displayedReviews.map((review, index) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 ${
              isRatingReview(review)
                ? "bg-slate-800/50 border-slate-700 hover:border-yellow-500/30"
                : "bg-blue-900/20 border-blue-800/30 hover:border-blue-600/50"
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-900 font-bold text-lg flex-shrink-0 ${
                  isRatingReview(review)
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-br from-blue-400 to-blue-500"
                }`}
              >
                {getInitials(review.userName)}
              </div>

              <div className="flex-1">
                {/* User info and type indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white text-lg">{review.userName}</h4>
                      {isRatingReview(review) ? (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                          Đánh giá
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          Bình luận
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {isRatingReview(review) && review.rating && (
                        <>
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-yellow-400 font-medium">{review.rating}/5</span>
                          <span className="text-slate-400">•</span>
                        </>
                      )}
                      <span className="text-slate-400 text-sm">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Review/Comment content */}
                {review.comment && review.comment !== "Đánh giá sao" && (
                  <div
                    className={`mb-3 p-4 rounded-lg ${
                      isRatingReview(review) ? "bg-slate-700/30" : "bg-blue-900/30 border border-blue-800/20"
                    }`}
                  >
                    <p className="text-slate-300 leading-relaxed">{review.comment}</p>
                  </div>
                )}

                {/* Rating Description for ratings only */}
                {isRatingReview(review) && review.rating && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
                      {review.rating === 5 && "Rất hài lòng"}
                      {review.rating === 4 && "Hài lòng"}
                      {review.rating === 3 && "Bình thường"}
                      {review.rating === 2 && "Không hài lòng"}
                      {review.rating === 1 && "Rất không hài lòng"}
                    </span>
                  </div>
                )}

                {/* Admin reply */}
                {review.adminReply && (
                  <div
                    className={`border-l-4 p-4 mt-4 rounded-r-lg ${
                      isRatingReview(review) ? "bg-yellow-900/20 border-yellow-400" : "bg-blue-900/20 border-blue-400"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <User
                        className={`w-4 h-4 mr-2 ${isRatingReview(review) ? "text-yellow-400" : "text-blue-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isRatingReview(review) ? "text-yellow-300" : "text-blue-300"
                        }`}
                      >
                        Phản hồi từ cửa hàng
                      </span>
                      {review.adminReplyAt && (
                        <span
                          className={`text-xs ml-2 ${isRatingReview(review) ? "text-yellow-400" : "text-blue-400"}`}
                        >
                          • {formatDate(review.adminReplyAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{review.adminReply}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show more/less button */}
      {reviews.length > 5 && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-yellow-400 hover:text-yellow-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all duration-300 border border-slate-600 hover:border-slate-500"
          >
            {showAllReviews ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Ẩn bớt
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Xem thêm {reviews.length - 5} mục
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewsList
