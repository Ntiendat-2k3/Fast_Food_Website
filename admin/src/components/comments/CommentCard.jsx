"use client"
import { Check, X, Trash2, Star, Reply, Edit, Send } from "lucide-react"

const CommentCard = ({
  comment,
  handleStatusChange,
  handleDeleteClick,
  handleReplyToComment,
  replyForm,
  setReplyForm,
  formatDate,
  getFoodName,
  getFoodCategory,
}) => {
  return (
    <div
      className={`bg-white dark:bg-dark rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border ${
        comment.isApproved ? "border-green-200 dark:border-green-900" : "border-yellow-200 dark:border-yellow-900"
      } p-4`}
    >
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div className="flex items-center mb-3 sm:mb-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 ${
              comment.isApproved
                ? "bg-green-100 dark:bg-green-900/30 text-green-500"
                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500"
            }`}
          >
            {comment.isApproved ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white text-sm">{comment.userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!comment.isApproved && (
            <button
              onClick={() => handleStatusChange(comment._id, true)}
              className="p-1.5 bg-green-100 text-green-500 rounded-full hover:bg-green-200 transition-colors"
              title="Duyệt đánh giá"
            >
              <Check size={16} />
            </button>
          )}
          {comment.isApproved && (
            <button
              onClick={() => handleStatusChange(comment._id, false)}
              className="p-1.5 bg-yellow-100 text-yellow-500 rounded-full hover:bg-yellow-200 transition-colors"
              title="Hủy duyệt"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => handleDeleteClick(comment._id)}
            className="p-1.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
            title="Xóa đánh giá"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-dark-lighter rounded-lg p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <div className="flex mr-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Đánh giá cho: {getFoodName(comment.foodId)}
          </span>
          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
            {getFoodCategory(comment.foodId)}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.comment}</p>

        {/* Admin Reply Section */}
        {comment.adminReply && comment.adminReply.message && replyForm.commentId !== comment._id ? (
          <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                <Reply size={12} className="mr-1" />
                Phản hồi của quản trị viên:
              </div>
              <button
                onClick={() => setReplyForm({ commentId: comment._id, message: comment.adminReply.message })}
                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                title="Chỉnh sửa phản hồi"
              >
                <Edit size={12} />
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-xs whitespace-pre-line">{comment.adminReply.message}</p>
            {comment.adminReply.createdAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(comment.adminReply.createdAt)}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Reply size={12} className="mr-1" />
              {replyForm.commentId === comment._id && comment.adminReply && comment.adminReply.message
                ? "Chỉnh sửa phản hồi:"
                : "Thêm phản hồi:"}
            </div>
            <textarea
              placeholder="Nhập phản hồi của bạn..."
              rows={2}
              value={replyForm.commentId === comment._id ? replyForm.message : ""}
              onChange={(e) => setReplyForm({ commentId: comment._id, message: e.target.value })}
              onClick={() => {
                if (replyForm.commentId !== comment._id) {
                  setReplyForm({
                    commentId: comment._id,
                    message: comment.adminReply?.message || "",
                  })
                }
              }}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
            <div className="flex justify-end mt-2 gap-2">
              {replyForm.commentId === comment._id && comment.adminReply && comment.adminReply.message && (
                <button
                  onClick={() => setReplyForm({ commentId: null, message: "" })}
                  className="px-2.5 py-1 rounded-lg text-xs flex items-center bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Hủy
                </button>
              )}
              <button
                onClick={handleReplyToComment}
                disabled={!replyForm.message || replyForm.commentId !== comment._id}
                className={`px-2.5 py-1 rounded-lg text-xs flex items-center ${
                  !replyForm.message || replyForm.commentId !== comment._id
                    ? "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                <Send size={12} className="mr-1" />
                {replyForm.commentId === comment._id && comment.adminReply && comment.adminReply.message
                  ? "Cập nhật"
                  : "Gửi phản hồi"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentCard
