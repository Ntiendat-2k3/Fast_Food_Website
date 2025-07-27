"use client"

import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { MessageCircle, X, ShoppingCart } from "lucide-react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

const CommentForm = ({ foodId, onCommentSubmitted, onCancel }) => {
  const { url, token, user } = useContext(StoreContext)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận")
      return
    }

    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }

    try {
      setIsSubmitting(true)

      console.log("Submitting comment:", {
        userId: user._id,
        foodId,
        comment: comment.trim(),
        type: "comment",
      })

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

      console.log("Comment response:", response.data)

      if (response.data.success) {
        toast.success("Bình luận thành công!")
        onCommentSubmitted()
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)

      if (error.response) {
        console.error("Error response:", error.response.data)
        toast.error(error.response.data.message || "Có lỗi xảy ra khi gửi bình luận")
      } else if (error.request) {
        console.error("Error request:", error.request)
        toast.error("Không thể kết nối đến server")
      } else {
        console.error("Error message:", error.message)
        toast.error("Có lỗi xảy ra khi gửi bình luận")
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
          <MessageCircle className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Viết bình luận</h3>
        </div>
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
              Bạn cần mua và hoàn thành đơn hàng chứa sản phẩm này trước khi có thể bình luận
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Nội dung bình luận</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ ý kiến của bạn về sản phẩm này..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            rows={4}
            required
          />
          <div className="text-right text-sm text-gray-400 mt-1">{comment.length}/500 ký tự</div>
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
            disabled={!comment.trim() || isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: comment.trim() ? 1.05 : 1 }}
            whileTap={{ scale: comment.trim() ? 0.95 : 1 }}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default CommentForm
