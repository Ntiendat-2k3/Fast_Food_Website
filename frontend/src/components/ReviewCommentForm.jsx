"use client"

import { useState, useContext } from "react"
import { Star, Send, X } from "lucide-react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

const ReviewCommentForm = ({ foodItem, onSubmitted, onCancel }) => {
  const { url, token, user } = useContext(StoreContext)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!rating) {
      toast.error("Vui lòng chọn số sao đánh giá")
      return
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá")
      return
    }

    if (comment.trim().length < 10) {
      toast.error("Nội dung đánh giá phải có ít nhất 10 ký tự")
      return
    }

    if (comment.trim().length > 500) {
      toast.error("Nội dung đánh giá không được vượt quá 500 ký tự")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await axios.post(
        `${url}/api/comment/add-comment`,
        {
          userId: user._id,
          foodId: foodItem._id,
          rating: rating,
          comment: comment.trim(),
        },
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        toast.success("Đánh giá của bạn đã được gửi thành công!")
        setRating(0)
        setComment("")
        onSubmitted()
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi gửi đánh giá")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${
              starValue <= (hoveredRating || rating) ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        </button>
      )
    })
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Viết đánh giá cho {foodItem?.name}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn *</label>
          <div className="flex items-center gap-1">
            {renderStars()}
            {rating > 0 && <span className="ml-2 text-sm text-gray-600">({rating} sao)</span>}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá *</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-500">Tối thiểu 10 ký tự</div>
            <div className={`text-xs ${comment.length > 450 ? "text-red-500" : "text-gray-500"}`}>
              {comment.length}/500
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !rating || !comment.trim() || comment.trim().length < 10}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewCommentForm
