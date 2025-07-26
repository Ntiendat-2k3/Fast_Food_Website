"use client"

import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { Star, X, MessageCircle } from "lucide-react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

const ReviewCommentForm = ({ foodId, onSubmitted, onCancel, userEligibility }) => {
  const { url, token, user } = useContext(StoreContext)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const canRate = userEligibility?.canReview && !userEligibility?.hasReviewed
  const canComment = userEligibility?.canComment && !userEligibility?.hasCommented

  const handleSubmitRating = async () => {
    if (!rating) {
      toast.error("Vui lòng chọn số sao đánh giá")
      return
    }

    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để đánh giá")
      return
    }

    try {
      setIsSubmittingRating(true)

      const response = await axios.post(
        `${url}/api/comment/add-comment`,
        {
          userId: user._id,
          foodId,
          rating,
          comment: comment || "Đánh giá sao",
          type: "rating",
        },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.success) {
        toast.success("Đánh giá thành công!")
        return true
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi đánh giá")
        return false
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      if (error.response) {
        toast.error(error.response.data.message || "Có lỗi xảy ra khi gửi đánh giá")
      } else {
        toast.error("Có lỗi xảy ra khi gửi đánh giá")
      }
      return false
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận")
      return
    }

    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }

    try {
      setIsSubmittingComment(true)

      const response = await axios.post(
        `${url}/api/comment/add-comment`,
        {
          userId: user._id,
          foodId,
          comment: comment.trim(),
          type: "comment",
        },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.success) {
        toast.success("Bình luận thành công!")
        return true
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi bình luận")
        return false
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      if (error.response) {
        toast.error(error.response.data.message || "Có lỗi xảy ra khi gửi bình luận")
      } else {
        toast.error("Có lỗi xảy ra khi gửi bình luận")
      }
      return false
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleSubmitBoth = async () => {
    let ratingSuccess = true
    let commentSuccess = true

    // Submit rating if user can rate and has selected rating
    if (canRate && rating > 0) {
      ratingSuccess = await handleSubmitRating()
    }

    // Submit comment if user can comment and has entered comment
    if (canComment && comment.trim()) {
      commentSuccess = await handleSubmitComment()
    }

    // If at least one submission was successful, refresh the list
    if (ratingSuccess || commentSuccess) {
      onSubmitted()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if user has anything to submit
    const hasRating = canRate && rating > 0
    const hasComment = canComment && comment.trim()

    if (!hasRating && !hasComment) {
      if (!canRate && !canComment) {
        toast.error("Bạn đã đánh giá và bình luận về sản phẩm này rồi")
      } else if (!canRate) {
        toast.error("Vui lòng nhập nội dung bình luận")
      } else if (!canComment) {
        toast.error("Vui lòng chọn số sao đánh giá")
      } else {
        toast.error("Vui lòng chọn đánh giá hoặc nhập bình luận")
      }
      return
    }

    await handleSubmitBoth()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <MessageCircle className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Đánh giá & Bình luận</h3>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        {canRate && (
          <div className="bg-slate-700/30 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <h4 className="text-lg font-medium text-white">Đánh giá sản phẩm</h4>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Cần mua hàng</span>
            </div>
            <p className="text-gray-300 mb-4">Bạn cảm thấy sản phẩm này như thế nào?</p>

            <div className="flex justify-center items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-400 font-medium text-center"
              >
                {rating === 1 && "Rất không hài lòng"}
                {rating === 2 && "Không hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Hài lòng"}
                {rating === 5 && "Rất hài lòng"}
              </motion.p>
            )}
          </div>
        )}

        {!canRate && userEligibility?.hasReviewed && (
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-400">Đánh giá sản phẩm</h4>
            </div>
            <p className="text-gray-500">Bạn đã đánh giá sản phẩm này rồi</p>
          </div>
        )}

        {!canRate && !userEligibility?.hasPurchased && (
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-red-400" />
              <h4 className="text-lg font-medium text-red-400">Đánh giá sản phẩm</h4>
            </div>
            <p className="text-red-300">Bạn cần mua sản phẩm này trước khi có thể đánh giá</p>
          </div>
        )}

        {/* Comment Section */}
        {canComment && (
          <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-medium text-white">Bình luận</h4>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Không cần mua hàng</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ ý kiến của bạn về sản phẩm này..."
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-400 mt-1">{comment.length}/500 ký tự</div>
          </div>
        )}

        {!canComment && userEligibility?.hasCommented && (
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-400">Bình luận</h4>
            </div>
            <p className="text-gray-500">Bạn đã bình luận về sản phẩm này rồi</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-center pt-4 border-t border-slate-600">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hủy
          </motion.button>

          <motion.button
            type="submit"
            disabled={
              isSubmittingRating ||
              isSubmittingComment ||
              (!canRate && !canComment) ||
              (canRate && !rating && canComment && !comment.trim()) ||
              (canRate && !rating && !canComment) ||
              (!canRate && canComment && !comment.trim())
            }
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-slate-900 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmittingRating || isSubmittingComment ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Đang gửi...
              </>
            ) : (
              <>
                {canRate && rating > 0 && canComment && comment.trim() && "Gửi đánh giá & bình luận"}
                {canRate && rating > 0 && (!canComment || !comment.trim()) && "Gửi đánh giá"}
                {(!canRate || !rating) && canComment && comment.trim() && "Gửi bình luận"}
                {(!canRate || !rating) && (!canComment || !comment.trim()) && "Gửi"}
              </>
            )}
          </motion.button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-400 bg-slate-700/20 rounded-lg p-3">
          <p>
            {canRate && canComment && "Bạn có thể vừa đánh giá vừa bình luận, hoặc chỉ làm một trong hai"}
            {canRate && !canComment && "Bạn có thể đánh giá sản phẩm này"}
            {!canRate && canComment && "Bạn có thể bình luận về sản phẩm này"}
            {!canRate && !canComment && "Bạn đã đánh giá và bình luận về sản phẩm này rồi"}
          </p>
        </div>
      </form>
    </motion.div>
  )
}

export default ReviewCommentForm
