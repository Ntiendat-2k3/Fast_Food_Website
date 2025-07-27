"use client"

import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { Star, MessageCircle, X } from "lucide-react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

const ReviewCommentForm = ({ foodId, onSubmitted, onCancel, userEligibility }) => {
  const { url, token, user } = useContext(StoreContext)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canReview = userEligibility?.canReview || false
  const canComment = userEligibility?.canComment || false

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canReview && !canComment) {
      toast.error("Bạn cần mua sản phẩm này trước khi có thể đánh giá hoặc bình luận")
      return
    }

    if (canReview && !rating) {
      toast.error("Vui lòng chọn số sao đánh giá")
      return
    }

    if (canComment && !comment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận")
      return
    }

    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để thực hiện")
      return
    }

    try {
      setIsSubmitting(true)

      // Gửi đánh giá nếu có
      if (canReview && rating > 0) {
        console.log("Submitting review:", {
          userId: user._id,
          foodId,
          rating,
          comment: comment || "Đánh giá sao",
          type: "rating",
        })

        const reviewResponse = await axios.post(
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

        if (!reviewResponse.data.success) {
          throw new Error(reviewResponse.data.message || "Có lỗi xảy ra khi gửi đánh giá")
        }
      }

      // Gửi bình luận nếu có và khác với đánh giá
      if (canComment && comment.trim() && (!canReview || rating === 0)) {
        console.log("Submitting comment:", {
          userId: user._id,
          foodId,
          comment: comment.trim(),
          type: "comment",
        })

        const commentResponse = await axios.post(
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

        if (!commentResponse.data.success) {
          throw new Error(commentResponse.data.message || "Có lỗi xảy ra khi gửi bình luận")
        }
      }

      // Thành công
      let successMessage = ""
      if (canReview && rating > 0) {
        successMessage = "Đánh giá thành công!"
      } else if (canComment && comment.trim()) {
        successMessage = "Bình luận thành công!"
      }

      toast.success(successMessage)
      onSubmitted()
    } catch (error) {
      console.error("Error submitting:", error)

      if (error.response) {
        console.error("Error response:", error.response.data)
        toast.error(error.response.data.message || "Có lỗi xảy ra")
      } else {
        toast.error(error.message || "Có lỗi xảy ra")
      }
    } finally {
      setIsSubmitting(false)
    }
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
            {canReview && <Star className="w-6 h-6 text-yellow-400" />}
            {canComment && <MessageCircle className="w-6 h-6 text-blue-400" />}
          </div>
          <h3 className="text-xl font-semibold text-white">
            {canReview && canComment ? "Đánh giá & Bình luận" : canReview ? "Đánh giá sản phẩm" : "Bình luận sản phẩm"}
          </h3>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating section */}
        {canReview && (
          <div className="text-center">
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
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-400 font-medium mb-4">
                {rating === 1 && "Rất không hài lòng"}
                {rating === 2 && "Không hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Hài lòng"}
                {rating === 5 && "Rất hài lòng"}
              </motion.p>
            )}
          </div>
        )}

        {/* Comment section */}
        {canComment && (
          <div>
            <label className="block text-gray-300 mb-2">
              {canReview ? "Nhận xét thêm (tùy chọn)" : "Nội dung bình luận"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                canReview ? "Chia sẻ trải nghiệm chi tiết của bạn..." : "Chia sẻ ý kiến của bạn về sản phẩm này..."
              }
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
              rows={4}
              required={!canReview}
            />
            <div className="text-right text-sm text-gray-400 mt-1">{comment.length}/500 ký tự</div>
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex gap-3 justify-center">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hủy
          </motion.button>

          <motion.button
            type="submit"
            disabled={isSubmitting || (canReview && !rating) || (canComment && !canReview && !comment.trim())}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSubmitting
              ? "Đang gửi..."
              : canReview && canComment
                ? "Gửi đánh giá & bình luận"
                : canReview
                  ? "Gửi đánh giá"
                  : "Gửi bình luận"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default ReviewCommentForm
