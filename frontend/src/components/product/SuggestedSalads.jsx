"use client"

import { useState, useEffect, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Salad } from "lucide-react"
import { StoreContext } from "../../context/StoreContext"
import SuggestedSaladRowItem from "./SuggestedSaladRowItem"
import axios from "axios"

const SuggestedSalads = ({ currentProduct, isCompact = true }) => {
  const { url } = useContext(StoreContext)
  const [suggestedSalads, setSuggestedSalads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchSuggestedSalads = async () => {
      if (!currentProduct) return

      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${url}/api/food/list`)

        if (response.data.success) {
          // Filter salads (items with "salad" in name or category)
          const allItems = response.data.data || []
          const salads = allItems.filter(
            (item) =>
              item._id !== currentProduct._id &&
              (item.name.toLowerCase().includes("salad") ||
                item.category?.toLowerCase().includes("salad") ||
                item.name.toLowerCase().includes("nộm") ||
                item.name.toLowerCase().includes("gỏi")),
          )

          // If no specific salads found, get random healthy items
          if (salads.length === 0) {
            const healthyItems = allItems
              .filter(
                (item) =>
                  item._id !== currentProduct._id &&
                  (item.category?.toLowerCase().includes("healthy") ||
                    item.category?.toLowerCase().includes("rau") ||
                    item.name.toLowerCase().includes("rau")),
              )
              .slice(0, 6)
            setSuggestedSalads(healthyItems)
          } else {
            setSuggestedSalads(salads.slice(0, 6))
          }
        } else {
          throw new Error(response.data.message || "Failed to fetch salads")
        }
      } catch (error) {
        console.error("Error fetching suggested salads:", error)
        setError(error.message)
        setSuggestedSalads([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedSalads()
  }, [currentProduct, url])

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Salad className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Gợi ý Salad</h3>
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

  if (error && suggestedSalads.length === 0) {
    return null
  }

  if (suggestedSalads.length === 0) {
    return null
  }

  const displayedSalads = isCompact && !showAll ? suggestedSalads.slice(0, 3) : suggestedSalads
  const hasMore = suggestedSalads.length > 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700 h-fit"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Salad className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Gợi ý Salad</h3>
        </div>
        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full whitespace-nowrap">
          {/* Phù hợp với {currentProduct.category || "món này"} */}
          Đồ ăn kèm phù hợp
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayedSalads.map((salad, index) => (
            <motion.div
              key={salad._id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <SuggestedSaladRowItem item={salad} url={url} isCompact={isCompact} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isCompact && hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-green-400 hover:text-green-300 transition-colors text-sm font-medium border border-green-400/20 rounded-lg hover:border-green-400/40"
        >
          {showAll ? "Thu gọn" : `Xem thêm ${suggestedSalads.length - 3} món salad khác`}
        </motion.button>
      )}
    </motion.div>
  )
}

export default SuggestedSalads
