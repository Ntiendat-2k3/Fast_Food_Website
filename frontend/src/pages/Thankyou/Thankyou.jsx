"use client"

import { useNavigate } from "react-router-dom"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"

const Thankyou = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden mt-20 mx-4 md:mx-auto max-w-6xl transition-colors duration-300">
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-4">Cảm ơn bạn đã đặt hàng!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Đơn hàng của bạn đã được xác nhận và đang được xử lý. Bạn sẽ nhận được thông báo khi đơn hàng được giao.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-100 dark:bg-dark-light hover:bg-gray-200 dark:hover:bg-dark text-dark dark:text-white py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <Home size={20} className="mr-2" />
            Về trang chủ
          </button>
          <button
            onClick={() => navigate("/myorders")}
            className="bg-primary hover:bg-primary-light text-dark py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
          >
            <ShoppingBag size={20} className="mr-2" />
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  )
}

export default Thankyou
