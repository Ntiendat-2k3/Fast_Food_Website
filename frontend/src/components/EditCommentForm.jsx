"use client"

import { useState } from "react"
import { Star, Save, X } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

const EditCommentForm = ({ comment, onSave, onCancel, url, token }) => {
  const [rating, setRating] = useState(comment.rating)
  const [hoverRating, setHoverRating] = useState(0)
  const [commentText, setCommentText] = useState(comment.comment)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (commentText.trim().length < 5) {
      toast.error("Vui lòng nhập nội dung đánh giá (ít nhất 5 ký tự)")
      return
    }

    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await axios.put(
        `${url}/api/comment/update`,
        {
          commentId: comment._id,
          rating: Number(rating),
          comment: commentText.trim(),
          userId: comment.userId,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.data.success) {
        toast.success("Cập nhật đánh giá thành công!")
        onSave(response.data.data)
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi cập nhật đánh giá")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      toast.error("Có lỗi xảy ra khi cập nhật đánh giá: " + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-light rounded-lg p-4 mt-3">
      <h4 className="text-sm font-medium text-dark dark:text-white mb-3">Chỉnh sửa đánh giá</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">Đánh giá của bạn</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  size={20}
                  className={`${
                    (hoverRating || rating) >= star
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Rất tốt"}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="edit-comment" className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
            Nội dung đánh giá
          </label>
          <textarea
            id="edit-comment"
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-gray-700 dark:text-gray-300 text-sm"
            required
            minLength={5}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tối thiểu 5 ký tự ({commentText.length}/5)</p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-light transition-colors text-sm flex items-center"
          >
            <X size={16} className="mr-1" />
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || commentText.trim().length < 5}
            className="px-3 py-1.5 bg-primary hover:bg-primary-light text-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
          >
            <Save size={16} className="mr-1" />
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditCommentForm
