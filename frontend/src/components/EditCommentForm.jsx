import { useState } from "react"
import { Star, Save, X, Edit3 } from 'lucide-react'
import { toast } from "react-toastify"
import axios from "axios"

const EditCommentForm = ({ comment, onSave, onCancel, url, token }) => {
  const [rating, setRating] = useState(comment.rating)
  const [hoverRating, setHoverRating] = useState(0)
  const [commentText, setCommentText] = useState(comment.comment)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (commentText.trim().length < 10) {
      toast.error("Vui lòng nhập nội dung đánh giá (ít nhất 10 ký tự)")
      return
    }

    if (commentText.trim().length > 500) {
      toast.error("Nội dung đánh giá không được vượt quá 500 ký tự")
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
          userId: comment.userId,
          rating: Number(rating),
          comment: commentText.trim(),
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

  const getRatingText = (rating) => {
    const ratingTexts = {
      1: "Rất tệ",
      2: "Tệ",
      3: "Bình thường",
      4: "Tốt",
      5: "Rất tốt",
    }
    return ratingTexts[rating] || ""
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mt-4 border border-gray-700 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
          <Edit3 size={20} className="text-orange-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">Chỉnh sửa đánh giá</h4>
          <p className="text-sm text-gray-400">Cập nhật trải nghiệm của bạn về sản phẩm này</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Đánh giá của bạn</label>

          <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-full hover:bg-yellow-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                >
                  <Star
                    size={24}
                    className={`transition-all duration-200 ${
                      (hoverRating || rating) >= star
                        ? "text-yellow-400 fill-yellow-400 scale-110 drop-shadow-lg"
                        : "text-gray-500 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">{rating}/5</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">
                  {getRatingText(rating)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Comment Section */}
        <div className="space-y-3">
          <label htmlFor="edit-comment" className="block text-sm font-medium text-gray-300">
            Nội dung đánh giá
          </label>

          <div className="relative">
            <textarea
              id="edit-comment"
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Chia sẻ trải nghiệm chi tiết của bạn về sản phẩm này..."
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 bg-gray-700/50 text-gray-200 placeholder-gray-500 resize-none transition-all duration-200 backdrop-blur-sm"
              required
              minLength={10}
              maxLength={500}
            />

            {/* Character Counter */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className={`text-xs font-medium ${commentText.length >= 10 ? "text-green-400" : "text-red-400"}`}>
                {commentText.length}/500
              </span>
              {commentText.length >= 10 && <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg"></div>}
            </div>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            Tối thiểu 10 ký tự để đảm bảo đánh giá có ý nghĩa
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200 font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500/50 backdrop-blur-sm"
          >
            <X size={16} />
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={isSubmitting || commentText.trim().length < 10}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transform hover:scale-105 disabled:hover:scale-100"
          >
            <Save size={16} />
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang lưu...
              </>
            ) : (
              "Cập nhật đánh giá"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditCommentForm
