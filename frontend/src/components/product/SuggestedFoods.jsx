"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import SuggestedFoodRowItem from "./SuggestedFoodRowItem"
import LoadingSpinner from "../common/LoadingSpinner"

const SuggestedFoods = ({ drinkName }) => {
  const { url } = useContext(StoreContext)
  const [suggestedFoods, setSuggestedFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const INITIAL_DISPLAY_COUNT = 3

  useEffect(() => {
    const fetchSuggestedFoods = async () => {
      if (!drinkName) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log(`🔍 Fetching suggested foods for drink: ${drinkName}`)

        const response = await axios.get(`${url}/api/food/suggested-foods/${encodeURIComponent(drinkName)}`)

        console.log("📦 Suggested foods response:", response.data)

        if (response.data.success) {
          setSuggestedFoods(response.data.data || [])
          console.log(`✅ Successfully loaded ${response.data.data?.length || 0} suggested foods`)
        } else {
          console.warn("⚠️ No suggested foods found:", response.data.message)
          setSuggestedFoods([])
          setError(response.data.message)
        }
      } catch (error) {
        console.error("❌ Error fetching suggested foods:", error)
        setError("Không thể tải gợi ý món ăn")
        setSuggestedFoods([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedFoods()
  }, [drinkName, url])

  // Reset showAll when drinkName changes
  useEffect(() => {
    setShowAll(false)
  }, [drinkName])

  const handleToggleShowAll = () => {
    setShowAll(!showAll)
  }

  const displayedFoods = showAll ? suggestedFoods : suggestedFoods.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMoreItems = suggestedFoods.length > INITIAL_DISPLAY_COUNT

  // Don't render if no drink name
  if (!drinkName) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            🍔 <span className="ml-2">Món ăn được gợi ý</span>
          </h3>
          <span className="text-sm text-slate-400">Phù hợp với {drinkName}</span>
        </div>
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="text-slate-400 mt-4 text-sm">Đang tìm món ăn phù hợp...</p>
        </div>
      </div>
    )
  }

  // No suggestions found
  if (suggestedFoods.length === 0) {
    return (
      <div className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            🍔 <span className="ml-2">Món ăn được gợi ý</span>
          </h3>
          <span className="text-sm text-slate-400">Phù hợp với {drinkName}</span>
        </div>
        <div className="text-center py-6">
          <div className="text-slate-500 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">Chưa có món ăn được gợi ý</p>
          <p className="text-slate-500 text-sm mt-1">Hãy thử khám phá menu của chúng tôi!</p>
        </div>
      </div>
    )
  }

  // Render suggested foods
  return (
    <div className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          🍔 <span className="ml-2">Món ăn được gợi ý</span>
        </h3>
        <span className="text-sm text-slate-400">Phù hợp với {drinkName}</span>
      </div>

      <div className="space-y-3">
        {displayedFoods.map((food) => (
          <SuggestedFoodRowItem key={food._id} food={food} />
        ))}
      </div>

      {/* Show more/less button */}
      {hasMoreItems && (
        <div className="mt-4 text-center">
          <button
            onClick={handleToggleShowAll}
            className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors duration-200 flex items-center justify-center mx-auto space-x-1 hover:bg-slate-800/30 px-3 py-2 rounded-lg"
          >
            <span>{showAll ? "Thu gọn" : `Xem thêm ${suggestedFoods.length - INITIAL_DISPLAY_COUNT} món khác`}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* Info message */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">💡 Gợi ý dựa trên sở thích của khách hàng khác</p>
      </div>
    </div>
  )
}

export default SuggestedFoods
