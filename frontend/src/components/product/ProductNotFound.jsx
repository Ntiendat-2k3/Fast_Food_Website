"use client"

import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const ProductNotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 max-w-md bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700"
      >
        <div className="text-primary text-6xl mb-6 font-bold">404</div>
        <h2 className="text-3xl font-bold text-white mb-4">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-300 mb-8 leading-relaxed">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <motion.button
          onClick={() => navigate("/foods")}
          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 py-3 px-8 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Quay lại thực đơn
        </motion.button>
      </motion.div>
    </div>
  )
}

export default ProductNotFound
