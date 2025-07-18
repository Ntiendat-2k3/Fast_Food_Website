"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"
import SuggestedDrinkRowItem from "./SuggestedDrinkRowItem"
import LoadingSpinner from "../common/LoadingSpinner"

const SuggestedDrinks = ({ productCategory, category, isCompact = false }) => {
  const { url, addToCart } = useContext(StoreContext)
  const [suggestedDrinks, setSuggestedDrinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Use productCategory or category, whichever is provided
  const targetCategory = productCategory || category

  console.log("SuggestedDrinks props:", { productCategory, category, isCompact })
  console.log("Target category:", targetCategory)

  useEffect(() => {
    const fetchSuggestedDrinks = async () => {
      if (!targetCategory) {
        console.log("⚠️ No category provided, loading random drinks...")
        try {
          setLoading(true)
          const response = await axios.get(`${url}/api/food/list`)
          if (response.data.success) {
            // Filter for drinks only
            const allDrinks = response.data.data.filter(
              (item) => item.category && item.category.toLowerCase().includes("uống"),
            )
            const randomDrinks = allDrinks.slice(0, 4)
            setSuggestedDrinks(randomDrinks)
            console.log("✅ Loaded random drinks:", randomDrinks)
          } else {
            setError("Không thể tải đồ uống")
          }
        } catch (err) {
          console.error("Error loading random drinks:", err)
          setError("Lỗi khi tải đồ uống")
        } finally {
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log(`🔍 Fetching suggested drinks for category: ${targetCategory}`)
        const response = await axios.get(`${url}/api/food/suggested-drinks/${encodeURIComponent(targetCategory)}`)

        console.log("📦 Suggested drinks response:", response.data)

        if (response.data.success && response.data.data) {
          setSuggestedDrinks(response.data.data)
          console.log(`✅ Successfully loaded drinks:`, response.data.data)
        } else {
          console.log("❌ Error from API:", response.data.message)
          setError(response.data.message)

          // Fallback: load random drinks
          console.log("🔄 Loading fallback drinks...")
          const fallbackResponse = await axios.get(`${url}/api/food/list`)
          if (fallbackResponse.data.success) {
            const allDrinks = fallbackResponse.data.data.filter(
              (item) => item.category && item.category.toLowerCase().includes("uống"),
            )
            const randomDrinks = allDrinks.slice(0, 4)
            setSuggestedDrinks(randomDrinks)
            console.log("✅ Loaded fallback drinks:", randomDrinks)
          }
        }
      } catch (err) {
        console.error("❌ Error fetching suggested drinks:", err)
        setError("Không thể tải gợi ý đồ uống")

        // Final fallback
        try {
          const fallbackResponse = await axios.get(`${url}/api/food/list`)
          if (fallbackResponse.data.success) {
            const allDrinks = fallbackResponse.data.data.filter(
              (item) => item.category && item.category.toLowerCase().includes("uống"),
            )
            const randomDrinks = allDrinks.slice(0, 4)
            setSuggestedDrinks(randomDrinks)
            console.log("✅ Final fallback drinks loaded:", randomDrinks)
          }
        } catch (finalErr) {
          console.error("❌ Final fallback failed:", finalErr)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedDrinks()
  }, [targetCategory, url])

  const handleAddToCart = (drinkName) => {
    addToCart(drinkName, 1)
    toast.success(`Đã thêm ${drinkName} vào giỏ hàng`)
  }

  if (!targetCategory) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
        <div className="text-red-400 mb-2">⚠️ Lỗi: Không có category</div>
        <div className="text-red-300 text-sm mb-2">
          Component SuggestedDrinks cần prop "productCategory" hoặc "category"
        </div>
        <div className="text-red-200 text-xs">
          Props nhận được: {JSON.stringify({ productCategory, category, isCompact })}
        </div>
        <div className="mt-4">
          <div className="text-yellow-400 mb-2">Hiển thị gợi ý mặc định:</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner />
        <p className="text-slate-400 mt-4">Đang tải gợi ý đồ uống...</p>
      </div>
    )
  }

  if (error && suggestedDrinks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">❌ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (suggestedDrinks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a8.949 8.949 0 008.354-5.646z"
            />
          </svg>
          <p>Chưa có gợi ý đồ uống cho danh mục này</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">🥤 Đồ uống được gợi ý</h3>
        <span className="text-slate-400 text-sm">Phù hợp với {targetCategory}</span>
      </div>

      <div className="space-y-4">
        {suggestedDrinks.map((drink, index) => {
          console.log(`Rendering drink ${index}:`, drink)
          return <SuggestedDrinkRowItem key={drink._id || index} item={drink} url={url} addToCart={addToCart} />
        })}
      </div>

      {error && <div className="text-center text-yellow-400 text-sm mt-4">⚠️ {error} - Hiển thị đồ uống ngẫu nhiên</div>}
    </div>
  )
}

export default SuggestedDrinks
