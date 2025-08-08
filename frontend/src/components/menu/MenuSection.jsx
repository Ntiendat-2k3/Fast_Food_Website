"use client"

import { useState, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from 'lucide-react'
import { StoreContext } from "../../context/StoreContext"
import MenuSectionHeader from "./MenuSectionHeader"
import ExploreMenu from "../ExploreMenu"
import FoodDisplay from "../FoodDisplay"

const MenuSection = ({ category, setCategory }) => {
  const { food_list } = useContext(StoreContext)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Extract unique categories from food_list
  const categories = ["All", ...new Set(food_list.map(item => item.category))]

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory)
    setIsDropdownOpen(false)
  }

  const getCategoryDisplayName = (cat) => {
    if (cat === "All") return "Tất cả danh mục"
    return cat
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-4 md:p-8 lg:p-12 shadow-2xl"
    >
      <MenuSectionHeader />

      {/* Desktop Menu - Hidden on mobile */}
      <div className="hidden md:block">
        <ExploreMenu category={category} setCategory={setCategory} />
      </div>

      {/* Mobile Dropdown Menu - Hidden on desktop */}
      <div className="md:hidden mb-6">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl px-4 py-3 text-white flex items-center justify-between hover:bg-slate-800/70 transition-all duration-300"
          >
            <span className="font-medium">
              {getCategoryDisplayName(category)}
            </span>
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
              >
                {categories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-700/50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                      category === cat
                        ? "bg-primary/20 text-primary border-l-4 border-primary"
                        : "text-white"
                    }`}
                  >
                    {getCategoryDisplayName(cat)}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}>
        <FoodDisplay category={category} />
      </motion.div>
    </motion.div>
  )
}

export default MenuSection
