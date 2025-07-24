"use client"

import { motion } from "framer-motion"
import { Star, ShoppingCart, User } from "lucide-react"

const ReviewEligibilityNotice = ({ type }) => {
  const getNoticeContent = () => {
    switch (type) {
      case "not-logged-in":
        return {
          icon: <User size={48} className="text-blue-400" />,
          title: "Cần đăng nhập để đánh giá",
          message: "Vui lòng đăng nhập để có thể đánh giá sản phẩm này.",
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-700",
          textColor: "text-blue-400",
        }

      case "not-purchased":
        return {
          icon: <ShoppingCart size={48} className="text-orange-400" />,
          title: "Chưa thể đánh giá sản phẩm",
          message: "Bạn cần mua và hoàn thành đơn hàng chứa sản phẩm này trước khi có thể đánh giá.",
          bgColor: "bg-orange-900/30",
          borderColor: "border-orange-700",
          textColor: "text-orange-400",
        }

      case "already-reviewed":
        return {
          icon: <Star size={48} className="text-green-400 fill-green-400" />,
          title: "Bạn đã đánh giá sản phẩm này",
          message: "Cảm ơn bạn đã đánh giá! Bạn có thể chỉnh sửa đánh giá hiện có nếu muốn.",
          bgColor: "bg-green-900/30",
          borderColor: "border-green-700",
          textColor: "text-green-400",
        }

      default:
        return {
          icon: <Star size={48} className="text-gray-400" />,
          title: "Không thể đánh giá",
          message: "Hiện tại bạn không thể đánh giá sản phẩm này.",
          bgColor: "bg-gray-900/30",
          borderColor: "border-gray-700",
          textColor: "text-gray-400",
        }
    }
  }

  const { icon, title, message, bgColor, borderColor, textColor } = getNoticeContent()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgColor} ${borderColor} border rounded-lg p-6 text-center`}
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className={`text-lg font-semibold ${textColor} mb-2`}>{title}</h3>
      <p className="text-gray-300 text-sm">{message}</p>
    </motion.div>
  )
}

export default ReviewEligibilityNotice
