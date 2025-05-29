"use client"

import { motion } from "framer-motion"

const ExploreMenu = ({ category, setCategory }) => {
  const categories = [
    { id: "All", name: "Tất cả", icon: "🍽️" },
    { id: "Burger", name: "Burger", icon: "🍔" },
    { id: "Burito", name: "Burito", icon: "🌯" },
    { id: "Chicken", name: "Chicken", icon: "🍗" },
    { id: "Hotdog", name: "Hotdog", icon: "🌭" },
    { id: "Pasta", name: "Pasta", icon: "🍝" },
    { id: "Salad", name: "Salad", icon: "🥗" },
    { id: "Sandwich", name: "Sandwich", icon: "🥪" },
    { id: "Tart", name: "Tart", icon: "🥧" },
  ]

  return (
    <div className="mb-16">
      <div className="flex justify-center">
        <motion.div
          className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-3 inline-flex flex-wrap justify-center gap-2 md:gap-3 max-w-full overflow-x-auto scrollbar-hide border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: "0 10px 25px rgba(234, 179, 8, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(item.id)}
              className={`group relative px-6 py-4 rounded-xl text-sm md:text-base font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                category === item.id
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/30"
                  : "bg-slate-700/50 text-white hover:bg-slate-700 border border-slate-600 hover:border-yellow-400/30"
              }`}
            >
              {/* Background glow effect for active item */}
              {category === item.id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl"
                  layoutId="activeCategory"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </div>

              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />

              {/* Sparkle effect for active item */}
              {category === item.id && (
                <>
                  <motion.div
                    className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  />
                  <motion.div
                    className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  />
                </>
              )}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Category description */}
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mt-6"
      >
        <p className="text-yellow-300 text-lg font-medium">
          {category === "All" && "Khám phá toàn bộ thực đơn đa dạng của chúng tôi"}
          {category === "Burger" && "Burger thơm ngon với patty tươi và topping đặc biệt"}
          {category === "Burito" && "Burito cuốn đầy đủ dinh dưỡng và hương vị Mexico"}
          {category === "Chicken" && "Gà nướng, chiên giòn với gia vị bí mật"}
          {category === "Hotdog" && "Hotdog nướng thơm lừng với sốt đặc trưng"}
          {category === "Pasta" && "Pasta Ý chính gốc với sốt kem và cà chua"}
          {category === "Salad" && "Salad tươi mát với rau củ organic"}
          {category === "Sandwich" && "Sandwich thơm ngon với nhân đa dạng"}
          {category === "Tart" && "Tart ngọt ngào hoàn hảo cho bữa tráng miệng"}
        </p>
      </motion.div>
    </div>
  )
}

export default ExploreMenu
