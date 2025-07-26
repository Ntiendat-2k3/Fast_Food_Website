"use client"

import { useState, useContext } from "react"
import { motion } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
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

      const response = await axios.post(
        `${url}/api/comment/add-comment`,
        {
          userId: user._id,
          foodId,
          comment: comment.trim(),
        },
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        toast.success("Bình luận thành công!")
        setComment("")
        onCommentSubmitted()
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast.error("Có lỗi xảy ra khi gửi bình luận")
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
        <div className="flex items-center gap-2">
          <MessageCircle className="text-primary" size={24} />
          <h3 className="text-xl font-semibold text-white">Viết bình luận</h3>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm này..."
            className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-400 mt-1">{comment.length}/500</div>
        </div>

        <div className="flex gap-3 justify-end">
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
            className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark text-slate-900 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
