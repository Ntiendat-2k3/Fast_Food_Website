"use client"

import { useNavigate } from "react-router-dom"
import { CheckCircle, Home, ShoppingBag, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const Thankyou = () => {
  const navigate = useNavigate()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-slate-800 py-20 px-4">
      <div className="relative max-w-3xl mx-auto">
        {/* Animated orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full filter blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8 text-center">
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle size={48} className="text-primary" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold text-white mb-2">Cảm ơn bạn đã đặt hàng!</h1>
              <div className="h-1 w-20 bg-primary mx-auto mb-6 rounded-full"></div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-gray-300 mb-8 max-w-md mx-auto">
              Đơn hàng của bạn đã được xác nhận và đang được xử lý. Bạn sẽ nhận được thông báo khi đơn hàng được giao.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="bg-slate-700/30 backdrop-blur-md p-5 rounded-xl mb-8 max-w-md mx-auto border border-slate-600/50"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Mã đơn hàng:</span>
                <span className="text-white font-medium">
                  #ORD-
                  {Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Trạng thái:</span>
                <span className="text-primary font-medium">Đã xác nhận</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Thời gian giao hàng dự kiến:</span>
                <span className="text-white font-medium">30-45 phút</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="group bg-slate-700/50 hover:bg-slate-700 text-white py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
              >
                <Home size={20} className="mr-2" />
                Về trang chủ
              </button>
              <button
                onClick={() => navigate("/myorders")}
                className="group bg-primary hover:bg-primary-dark text-dark py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
              >
                <ShoppingBag size={20} className="mr-2" />
                Xem đơn hàng
                <ArrowRight
                  size={16}
                  className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Thankyou
