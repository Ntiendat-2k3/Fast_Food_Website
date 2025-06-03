"use client"

import { ShoppingBag, AlertCircle, Info } from "lucide-react"
import { motion } from "framer-motion"

const ReviewEligibilityNotice = ({ type = "not-purchased" }) => {
  // Các loại thông báo khác nhau
  const notices = {
    "not-purchased": {
      icon: ShoppingBag,
      title: "Cần mua sản phẩm để đánh giá",
      message: "Bạn cần mua và nhận được sản phẩm này trước khi có thể viết đánh giá",
      color: "blue",
      animation: "pulse",
    },
    "not-logged-in": {
      icon: AlertCircle,
      title: "Cần đăng nhập để đánh giá",
      message: "Vui lòng đăng nhập để có thể viết đánh giá cho sản phẩm này",
      color: "amber",
      animation: "bounce",
    },
    "already-reviewed": {
      icon: Info,
      title: "Bạn đã đánh giá sản phẩm này",
      message: "Bạn có thể chỉnh sửa đánh giá hiện có bằng cách nhấn nút 'Sửa' bên cạnh đánh giá của mình",
      color: "emerald",
      animation: "none",
    },
  }

  const currentNotice = notices[type] || notices["not-purchased"]
  const Icon = currentNotice.icon

  // Màu sắc dựa trên loại thông báo
  const colorClasses = {
    blue: {
      bg: "bg-blue-900/30",
      border: "border-blue-700",
      iconBg: "bg-blue-800/50",
      iconColor: "text-blue-400",
      title: "text-blue-300",
      text: "text-blue-400",
      highlight: "text-blue-300",
      noteBox: "bg-blue-950/50 border-blue-800/50",
    },
    amber: {
      bg: "bg-amber-900/30",
      border: "border-amber-700",
      iconBg: "bg-amber-800/50",
      iconColor: "text-amber-400",
      title: "text-amber-300",
      text: "text-amber-400",
      highlight: "text-amber-300",
      noteBox: "bg-amber-950/50 border-amber-800/50",
    },
    emerald: {
      bg: "bg-emerald-900/30",
      border: "border-emerald-700",
      iconBg: "bg-emerald-800/50",
      iconColor: "text-emerald-400",
      title: "text-emerald-300",
      text: "text-emerald-400",
      highlight: "text-emerald-300",
      noteBox: "bg-emerald-950/50 border-emerald-800/50",
    },
  }

  const colors = colorClasses[currentNotice.color]

  return (
    <div className={`rounded-xl ${colors.bg} border ${colors.border} p-6 shadow-lg`}>
      <div className="flex flex-col items-center text-center py-6 space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`p-4 rounded-full ${colors.iconBg} ${colors.iconColor}`}
        >
          <Icon size={40} strokeWidth={1.5} />
        </motion.div>

        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`text-xl font-bold ${colors.title}`}
        >
          {currentNotice.title}
        </motion.h3>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`text-base ${colors.text} max-w-md`}
        >
          {currentNotice.message}
        </motion.p>

        {type === "not-purchased" && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`mt-4 p-4 rounded-lg ${colors.noteBox} w-full max-w-md`}
          >
            <p className={`text-sm ${colors.highlight}`}>
              💡 <strong>Lưu ý:</strong> Hệ thống đánh giá của chúng tôi chỉ cho phép những khách hàng đã mua và nhận
              được sản phẩm mới có thể đánh giá. Điều này đảm bảo tính chính xác và khách quan của các đánh giá.
            </p>
          </motion.div>
        )}

        {type === "not-purchased" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center"
          >
            <a
              href="/foods"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300 text-center"
            >
              Khám phá thực đơn
            </a>
            <a
              href="/my-orders"
              className="px-6 py-3 bg-transparent border border-blue-600 text-blue-400 hover:bg-blue-900/30 rounded-lg font-medium transition-colors duration-300 text-center"
            >
              Xem đơn hàng của tôi
            </a>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ReviewEligibilityNotice
