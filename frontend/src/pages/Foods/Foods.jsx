"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ExploreMenu from "../../components/ExploreMenu"
import FoodDisplay from "../../components/FoodDisplay"

const Foods = () => {
  const [category, setCategory] = useState("All")

  return (
    <div className="bg-white dark:bg-dark min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-dark dark:text-white">Thực đơn </span>
              <span className="text-primary">của chúng tôi</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Khám phá các món ăn ngon được chế biến từ nguyên liệu tươi sống bởi các đầu bếp chuyên nghiệp của chúng
              tôi.
            </p>
          </div>

          <ExploreMenu category={category} setCategory={setCategory} />
          <FoodDisplay category={category} />
        </motion.div>
      </div>
    </div>
  )
}

export default Foods
