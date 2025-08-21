"use client"

import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Utensils } from "lucide-react"
import { StoreContext } from "../../context/StoreContext"
import SuggestedSaladRowItem from "./SuggestedSaladRowItem"
import axios from "axios"

const SuggestedSalads = ({ currentProduct, isCompact = true }) => {
  const { url } = useContext(StoreContext)
  const [suggestedFoods, setSuggestedFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchSuggestedFoods = async () => {
      if (!currentProduct) return

      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${url}/api/food/list`)

        if (response.data.success) {
          const allItems = response.data.data || []

          // Check if current product is a salad
          const isCurrentProductSalad =
            currentProduct.name.toLowerCase().includes("salad") ||
            currentProduct.category?.toLowerCase().includes("salad") ||
            currentProduct.name.toLowerCase().includes("nộm") ||
            currentProduct.name.toLowerCase().includes("gỏi")

          // Check if current product is a drink
          const isCurrentProductDrink =
            currentProduct.category?.toLowerCase().includes("uống") ||
            currentProduct.category?.toLowerCase().includes("drink") ||
            currentProduct.category?.toLowerCase().includes("nước") ||
            currentProduct.category?.toLowerCase().includes("beverage")

          let filteredItems = []

          if (isCurrentProductSalad) {
            filteredItems = allItems.filter((item) => {
              // Exclude current product
              if (item._id === currentProduct._id) return false

              // Exclude other salads
              const isSalad =
                item.name.toLowerCase().includes("salad") ||
                item.category?.toLowerCase().includes("salad") ||
                item.name.toLowerCase().includes("nộm") ||
                item.name.toLowerCase().includes("gỏi")
              if (isSalad) return false

              // Exclude drinks (since drinks have separate section on the right)
              const isDrink =
                item.category?.toLowerCase().includes("uống") ||
                item.category?.toLowerCase().includes("drink") ||
                item.category?.toLowerCase().includes("nước") ||
                item.category?.toLowerCase().includes("beverage")
              if (isDrink) return false

              // Include only food items
              return true
            })
          } else {
            // If current product is food or drink → suggest only salads
            filteredItems = allItems.filter((item) => {
              // Exclude current product
              if (item._id === currentProduct._id) return false

              // Only include salads
              const isSalad =
                item.name.toLowerCase().includes("salad") ||
                item.category?.toLowerCase().includes("salad") ||
                item.name.toLowerCase().includes("nộm") ||
                item.name.toLowerCase().includes("gỏi")

              return isSalad
            })
          }

          setSuggestedFoods(filteredItems.slice(0, 6))
        } else {
          throw new Error(response.data.message || "Failed to fetch foods")
        }
      } catch (error) {
        console.error("Error fetching suggested foods:", error)
        setError(error.message)
        setSuggestedFoods([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedFoods()
  }, [currentProduct, url])

  const getSuggestionTitle = () => {
    const isCurrentProductSalad =
      currentProduct.name.toLowerCase().includes("salad") ||
      currentProduct.category?.toLowerCase().includes("salad") ||
      currentProduct.name.toLowerCase().includes("nộm") ||
      currentProduct.name.toLowerCase().includes("gỏi")

    if (isCurrentProductSalad) {
      return "Món ăn được gợi ý"
    } else {
      return "Salad được gợi ý"
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{getSuggestionTitle()}</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-slate-600 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && suggestedFoods.length === 0) {
    return null
  }

  if (suggestedFoods.length === 0) {
    return null
  }

  const displayedFoods = isCompact && !showAll ? suggestedFoods.slice(0, 3) : suggestedFoods
  const hasMore = suggestedFoods.length > 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700 h-fit"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{getSuggestionTitle()}</h3>
        </div>
        <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full whitespace-nowrap">
          Phù hợp với {currentProduct.name || "món này"}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayedFoods.map((food, index) => (
            <motion.div
              key={food._id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <SuggestedSaladRowItem item={food} url={url} isCompact={isCompact} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isCompact && hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium border border-orange-400/20 rounded-lg hover:border-orange-400/40"
        >
          {showAll ? "Thu gọn" : `Xem thêm ${suggestedFoods.length - 3} món khác`}
        </motion.button>
      )}
    </motion.div>
  )
}

export default SuggestedSalads
