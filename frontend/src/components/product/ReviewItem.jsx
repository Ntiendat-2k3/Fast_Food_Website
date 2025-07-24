"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import { useState } from "react"

const ReviewItem = ({
  review,
  index,
  token,
  user,
  editingRatingId,
  handleEditRating,
  handleSaveEdit,
  handleCancelEdit,
  url,
}) => {
  return (
    <motion.div
      key={review._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-700/30 rounded-xl p-6 border border-slate-600"
    >
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-slate-900 font-bold mr-4">
          {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-white">{review.userName}</h4>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                {review.updatedAt && <span className="ml-1 text-xs">(đã chỉnh sửa)</span>}
              </span>
              {token && user && review.userId === user._id && (
                <motion.button
                  onClick={() => handleEditRating(review._id)}
                  className="text-xs text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded border border-primary hover:bg-primary hover:text-slate-900"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✏️ Sửa
                </motion.button>
              )}
            </div>
          </div>

          {editingRatingId === review._id ? (
            <EditRatingForm
              rating={review}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              url={url}
              token={token}
            />
          ) : (
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < review.rating ? "text-primary fill-primary" : "text-gray-500"} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Component để chỉnh sửa rating
const EditRatingForm = ({ rating, onSave, onCancel, url, token }) => {
  const [newRating, setNewRating] = useState(rating.rating)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (newRating < 1 || newRating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await axios.put(
        `${url}/api/comment/update`,
        {
          ratingId: rating._id,
          rating: newRating,
          userId: rating.userId,
        },
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        toast.success("Cập nhật đánh giá thành công!")
        onSave(response.data.data)
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error updating rating:", error)
      toast.error("Có lỗi xảy ra khi cập nhật đánh giá")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 text-sm">Đánh giá mới</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNewRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={20}
                className={`${
                  (hoverRating || newRating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1 bg-primary text-slate-900 rounded text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border border-slate-600 text-gray-300 rounded text-sm hover:bg-slate-700 transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}

export default ReviewItem
