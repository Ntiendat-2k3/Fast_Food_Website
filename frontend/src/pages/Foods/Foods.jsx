"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ExploreMenu from "../../components/ExploreMenu"
import FoodDisplay from "../../components/FoodDisplay"

const Foods = () => {
  const [category, setCategory] = useState("All")

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-400/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-300/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;1.5&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative inline-block"
              >
                <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
                  THỰC ĐƠN
                  <br />
                  <span className="text-4xl md:text-6xl bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                    ĐẶC BIỆT
                  </span>
                </h1>

                {/* Decorative Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                <motion.div
                  className="absolute -bottom-2 -left-6 w-6 h-6 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>

              <motion.p
                className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Khám phá hành trình ẩm thực đỉnh cao với những món ăn được chế biến từ
                <span className="text-yellow-300 font-semibold"> nguyên liệu tươi sống </span>
                bởi các đầu bếp
                <span className="text-yellow-300 font-semibold"> chuyên nghiệp hàng đầu</span>
              </motion.p>

              {/* Stats Cards */}
              <motion.div
                className="flex flex-wrap justify-center gap-6 mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {[
                  { number: "100+", label: "Món ăn đặc biệt" },
                  { number: "50K+", label: "Khách hàng hài lòng" },
                  { number: "5★", label: "Đánh giá trung bình" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 min-w-[140px]"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{stat.number}</div>
                    <div className="text-gray-300 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Menu Section with Glass Effect */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl"
            >
              {/* Section Header */}
              <div className="text-center mb-12">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Danh Mục Món Ăn
                </motion.h2>
                <motion.div
                  className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-400 mx-auto rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 96 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                />
              </div>

              <ExploreMenu category={category} setCategory={setCategory} />

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}>
                <FoodDisplay category={category} />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Foods
