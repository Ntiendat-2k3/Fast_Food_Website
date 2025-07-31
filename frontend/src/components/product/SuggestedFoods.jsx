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
  const [debugInfo, setDebugInfo] = useState(null)

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

        // First call debug endpoint to understand the data
        try {
          const debugResponse = await axios.get(`${url}/api/food/debug-foods/${encodeURIComponent(drinkName)}`)
          if (debugResponse.data.success) {
            setDebugInfo(debugResponse.data.debug)
            console.log("🐛 Debug info:", debugResponse.data.debug)
          }
        } catch (debugError) {
          console.warn("Debug endpoint failed:", debugError)
        }

        // Then call the main endpoint
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

  // Don't render if no drink name
  if (!drinkName) {
    return (
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">⚠️ Không có tên đồ uống để gợi ý món ăn</p>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🍔 Món ăn được gợi ý</h3>
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="text-gray-500 mt-4">Đang tìm món ăn phù hợp với {drinkName}...</p>
        </div>
      </div>
    )
  }

  // Show debug info if available and no foods found
  if (debugInfo && suggestedFoods.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🍔 Món ăn được gợi ý</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">🐛 Thông tin debug:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              • Đồ uống: <strong>{debugInfo.targetDrink}</strong>
            </p>
            <p>
              • Tìm thấy đồ uống: <strong>{debugInfo.drinkExists ? "Có" : "Không"}</strong>
            </p>
            <p>
              • Category của đồ uống: <strong>{debugInfo.drinkCategory}</strong>
            </p>
            <p>
              • Số đơn hàng có đồ uống này: <strong>{debugInfo.ordersFound}</strong>
            </p>
            <p>
              • Tổng số món ăn có sẵn: <strong>{debugInfo.totalFoodsAvailable}</strong>
            </p>
            <p>• Món ăn theo category:</p>
            <ul className="ml-4 list-disc">
              {Object.entries(debugInfo.foodsByCategory || {}).map(([cat, count]) => (
                <li key={cat}>
                  {cat}: {count} món
                </li>
              ))}
            </ul>
            <p>• Top gợi ý:</p>
            <ul className="ml-4 list-disc">
              {debugInfo.topSuggestions?.slice(0, 5).map(([name, count]) => (
                <li key={name}>
                  {name}: {count} lần
                </li>
              ))}
            </ul>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">⚠️ {error}</p>
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (error && suggestedFoods.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🍔 Món ăn được gợi ý</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-yellow-600 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-yellow-700 font-medium">Chưa có gợi ý món ăn</p>
          <p className="text-yellow-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  // No suggestions found
  if (suggestedFoods.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🍔 Món ăn được gợi ý</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Chưa có món ăn được gợi ý</p>
          <p className="text-gray-500 text-sm mt-1">Hãy thử khám phá menu của chúng tôi!</p>
        </div>
      </div>
    )
  }

  // Render suggested foods
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">🍔 Món ăn được gợi ý với {drinkName}</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{suggestedFoods.length} món</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {suggestedFoods.map((food) => (
          <SuggestedFoodRowItem key={food._id} food={food} />
        ))}
      </div>

      {/* Info message */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">💡 Gợi ý dựa trên sở thích của khách hàng khác</p>
        {error && <p className="text-xs text-yellow-600 mt-1">⚠️ {error} - Hiển thị kết quả có sẵn</p>}
      </div>
    </div>
  )
}

export default SuggestedFoods
