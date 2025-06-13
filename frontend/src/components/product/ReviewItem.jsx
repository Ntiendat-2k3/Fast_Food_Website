"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import EditCommentForm from "../../components/EditCommentForm"

const ReviewItem = ({
  review,
  index,
  token,
  user,
  editingCommentId,
  handleEditComment,
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
                  onClick={() => handleEditComment(review._id)}
                  className="text-xs text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded border border-primary hover:bg-primary hover:text-slate-900"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✏️ Sửa
                </motion.button>
              )}
            </div>
          </div>

          {editingCommentId === review._id ? (
            <EditCommentForm
              comment={review}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              url={url}
              token={token}
            />
          ) : (
            <>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? "text-primary fill-primary" : "text-gray-500"}
                  />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed">{review.comment}</p>

              {/* Admin Reply */}
              {review.adminReply && review.adminReply.message && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-400 mb-1">Phản hồi từ quản trị viên:</p>
                  <p className="text-green-300 text-sm">{review.adminReply.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.adminReply.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ReviewItem
