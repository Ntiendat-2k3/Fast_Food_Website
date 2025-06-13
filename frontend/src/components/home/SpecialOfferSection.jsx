"use client"
import { Link } from "react-router-dom"

const SpecialOfferSection = () => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-slate-700">
          <div className="md:w-1/2 p-8 md:p-12">
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 text-sm font-bold px-3 py-1 rounded-full mb-4">
              Ưu đãi đặc biệt
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Combo burger đặc biệt</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Thưởng thức combo burger đặc biệt của chúng tôi với giá ưu đãi. Chỉ áp dụng trong hôm nay, đừng bỏ lỡ cơ
              hội này!
            </p>
            <div className="mb-6">
              <span className="text-yellow-400 text-5xl font-bold">45.000đ</span>
              <span className="text-gray-400 text-xl ml-2 line-through">69.000đ</span>
            </div>
            <Link
              to="/foods"
              className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
            >
              Đặt ngay
            </Link>
          </div>
          <div className="md:w-1/2 relative">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1202&q=80"
              alt="Burger đặc biệt"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
              -35%
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SpecialOfferSection
