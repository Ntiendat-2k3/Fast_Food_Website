"use client"

import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { Star, X, ShoppingCart } from "lucide-react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

const ReviewForm = ({ foodId, onReviewSubmitted, onCancel }) => {
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

    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để đánh giá")
      return
    }

    try {
      setIsSubmitting(true)

      console.log("Submitting review:", {
        userId: user._id,
        foodId,
        rating,
        comment: comment || "Đánh giá sao",
        type: "rating",
      })

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

      console.log("Review response:", response.data)

      if (response.data.success) {
        toast.success("Đánh giá thành công!")
        onReviewSubmitted()
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error submitting rating:", error)

      if (error.response) {
        console.error("Error response:", error.response.data)
        toast.error(error.response.data.message || "Có lỗi xảy ra khi gửi đánh giá")
      } else if (error.request) {
        console.error("Error request:", error.request)
        toast.error("Không thể kết nối đến server")
      } else {
        console.error("Error message:", error.message)
        toast.error("Có lỗi xảy ra khi gửi đánh giá")
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
        <h3 className="text-xl font-semibold text-white">Đánh giá sản phẩm</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Warning message */}
      <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-orange-400" />
          <div>
            <h4 className="text-orange-400 font-semibold">Yêu cầu mua hàng</h4>
            <p className="text-orange-300 text-sm">
              Bạn cần mua và hoàn thành đơn hàng chứa sản phẩm này trước khi có thể đánh giá
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label className="block text-gray-300 mb-2">Nhận xét (tùy chọn)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
            rows={4}
          />
        </div>

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
            disabled={!rating || isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-slate-900 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: rating ? 1.05 : 1 }}
            whileTap={{ scale: rating ? 0.95 : 1 }}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default ReviewForm
