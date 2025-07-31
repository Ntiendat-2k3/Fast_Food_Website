"use client"

import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChefHat, ChevronDown, ChevronUp } from "lucide-react"
import { StoreContext } from "../../context/StoreContext"
import SuggestedFoodRowItem from "./SuggestedFoodRowItem"
import axios from "axios"

const SuggestedFoods = ({ currentProductId, isCompact = true }) => {
  const { url } = useContext(StoreContext)
  const [suggestedFoods, setSuggestedFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchSuggestedFoods = async () => {
      if (!currentProductId) return

      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${url}/api/food/suggested-foods/${currentProductId}`)

        console.log(response.data);


        if (response.data.success) {
          setSuggestedFoods(response.data.data || [])
        } else {
          throw new Error(response.data.message || "Failed to fetch suggested foods")
        }
      } catch (error) {
        console.error("Error fetching suggested foods:", error)
        setError(error.message)

        // Fallback: fetch random foods from the same category or all foods
        try {
          const fallbackResponse = await axios.get(`${url}/api/food/list`)
          if (fallbackResponse.data.success) {
            const allFoods = fallbackResponse.data.data || []
            const filteredFoods = allFoods.filter((food) => food._id !== currentProductId).slice(0, 6)
            setSuggestedFoods(filteredFoods)
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError)
          setSuggestedFoods([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedFoods()
  }, [currentProductId, url])

  if (loading) {
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Gợi ý món ăn</h3>
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
    return (
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Gợi ý món ăn</h3>
        </div>
        <div className="text-center py-6 text-gray-400">
          <p>Không thể tải gợi ý món ăn</p>
        </div>
      </div>
    )
  }

  if (suggestedFoods.length === 0) {
    return null
  }

  const displayedFoods = isCompact && !showAll ? suggestedFoods.slice(0, 3) : suggestedFoods
  const hasMore = suggestedFoods.length > 3

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Gợi ý món ăn</h3>
          <span className="text-sm text-gray-400">({suggestedFoods.length} món)</span>
        </div>
        {isCompact && hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            {showAll ? (
              <>
                Thu gọn <ChevronUp size={16} />
              </>
            ) : (
              <>
                Xem thêm <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
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
              <SuggestedFoodRowItem item={food} url={url} isCompact={isCompact} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isCompact && hasMore && !showAll && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAll(true)}
          className="w-full mt-3 py-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium border border-primary/20 rounded-lg hover:border-primary/40"
        >
          Xem thêm {suggestedFoods.length - 3} món khác
        </motion.button>
      )}
    </div>
  )
}

export default SuggestedFoods
