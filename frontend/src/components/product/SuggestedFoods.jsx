"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import SuggestedFoodRowItem from "./SuggestedFoodRowItem"
import LoadingSpinner from "../common/LoadingSpinner"

const SuggestedFoods = ({ drinkName, drinkId }) => {
  const { url } = useContext(StoreContext)
  const [suggestedFoods, setSuggestedFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [suggestionType, setSuggestionType] = useState("loading")

  const INITIAL_DISPLAY_COUNT = 3

  useEffect(() => {
    const fetchSuggestedFoods = async () => {
      if (!drinkName && !drinkId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setSuggestionType("loading")

        let response
        let suggestionMethod = "random"

        if (drinkId) {
          try {
            response = await axios.get(`${url}/api/food/suggested-foods-by-drink/${drinkId}`)
            if (response.data.success && response.data.data && response.data.data.length > 0) {
              suggestionMethod = response.data.data[0]?.suggestionType || "drink-specific"
            } else {
              response = null
            }
          } catch (err) {
            response = null
          }
        }

        if (!response && drinkName) {
          try {
            response = await axios.get(`${url}/api/food/suggested-foods/${encodeURIComponent(drinkName)}`)
            if (response.data.success && response.data.data && response.data.data.length > 0) {
              suggestionMethod = "name-based"
            }
          } catch (err) {
            response = null
          }
        }

        if (response && response.data.success) {
          setSuggestedFoods(response.data.data || [])
          setSuggestionType(suggestionMethod)
        } else {
          setSuggestedFoods([])
          setSuggestionType("none")
          setError("Không tìm thấy món ăn phù hợp")
        }
      } catch (error) {
        console.error("❌ Error fetching suggested foods:", error)
        setError("Không thể tải gợi ý món ăn")
        setSuggestedFoods([])
        setSuggestionType("error")
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedFoods()
  }, [drinkName, drinkId, url])

  // Reset showAll when drinkName or drinkId changes
  useEffect(() => {
    setShowAll(false)
  }, [drinkName, drinkId])

  const handleToggleShowAll = () => {
    setShowAll(!showAll)
  }

  const displayedFoods = showAll ? suggestedFoods : suggestedFoods.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMoreItems = suggestedFoods.length > INITIAL_DISPLAY_COUNT

  // Don't render if no drink name or ID
  if (!drinkName && !drinkId) {
    return null
  }

  const getSuggestionTitle = () => {
    switch (suggestionType) {
      case "drink-specific":
        return `🍔 Món ăn được gợi ý cho "${drinkName || "đồ uống này"}"`
      case "name-based":
        return `🍔 Món ăn phù hợp với ${drinkName}`
      case "category-based":
        return `🍔 Món ăn được gợi ý theo danh mục`
      default:
        return `🍔 Món ăn được gợi ý`
    }
  }

  const getSuggestionSubtitle = () => {
    switch (suggestionType) {
      case "drink-specific":
        return "Dựa trên lịch sử mua hàng cụ thể"
      case "name-based":
        return "Dựa trên tên đồ uống"
      case "category-based":
        return "Dựa trên danh mục đồ uống"
      default:
        return `Phù hợp với ${drinkName || drinkId}`
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            🍔 <span className="ml-2">Món ăn được gợi ý</span>
          </h3>
          <span className="text-sm text-slate-400">Đang tải...</span>
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
          <span className="text-sm text-slate-400">{getSuggestionSubtitle()}</span>
        </div>
        <div className="text-center py-6">
          <div className="text-slate-500 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"
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
          🍔 <span className="ml-2">{getSuggestionTitle()}</span>
        </h3>
        <span className="text-sm text-slate-400">{getSuggestionSubtitle()}</span>
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
        <p className="text-xs text-slate-500 text-center">
          💡{" "}
          {suggestionType === "drink-specific"
            ? "Gợi ý dựa trên lịch sử mua hàng thực tế"
            : "Gợi ý dựa trên sở thích của khách hàng khác"}
        </p>
      </div>
    </div>
  )
}

export default SuggestedFoods
