"use client"

import { motion } from "framer-motion"

const ExploreMenu = ({ category, setCategory }) => {
  const categories = [
    { id: "All", name: "Tất cả" },
    { id: "Burger", name: "Burger" },
    { id: "Burito", name: "Burito" },
    { id: "Chicken", name: "Chicken" },
    { id: "Hotdog", name: "Hotdog" },
    { id: "Pasta", name: "Pasta" },
    { id: "Salad", name: "Salad" },
    { id: "Sandwich", name: "Sandwich" },
    { id: "Tart", name: "Tart" },
  ]

  return (
    <div className="mb-10">
      <div className="flex justify-center">
        <div className="bg-white dark:bg-dark-light rounded-xl shadow-md p-2 inline-flex flex-wrap justify-center gap-1 md:gap-2 max-w-full overflow-x-auto scrollbar-hide">
          {categories.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(item.id)}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap ${
                category === item.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark"
              }`}
            >
              {item.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExploreMenu
