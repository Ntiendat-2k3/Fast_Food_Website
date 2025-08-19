"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"
import SuggestedDrinkRowItem from "./SuggestedDrinkRowItem"
import LoadingSpinner from "../common/LoadingSpinner"

const SuggestedDrinks = ({ productCategory, category, productId, productName, isCompact = false }) => {
  const { url, addToCart } = useContext(StoreContext)
  const [suggestedDrinks, setSuggestedDrinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [suggestionType, setSuggestionType] = useState("loading")

  // Use productId first, then productCategory or category as fallback
  const targetCategory = productCategory || category

  console.log("SuggestedDrinks props:", { productCategory, category, productId, productName, isCompact })

  useEffect(() => {
    const fetchSuggestedDrinks = async () => {
      setLoading(true)
      setError(null)
      setSuggestionType("loading")

      try {
        let response
        let suggestionMethod = "random"

        if (productId) {
          console.log(`🔍 [DEBUG] Fetching product-specific suggested drinks for product ID: ${productId}`)
          console.log(`🔍 [DEBUG] API URL: ${url}/api/food/suggested-drinks-by-product/${productId}`)
          try {
            response = await axios.get(`${url}/api/food/suggested-drinks-by-product/${productId}`)
            console.log(`🔍 [DEBUG] API Response:`, response.data)

            if (response.data.success && response.data.data && response.data.data.length > 0) {
              suggestionMethod = response.data.data[0]?.suggestionType || "product-specific"
              console.log(`✅ [DEBUG] Product-specific suggestions found: ${response.data.data.length} drinks`)
              console.log(`✅ [DEBUG] Suggestion method: ${suggestionMethod}`)
              console.log(`✅ [DEBUG] First suggestion:`, response.data.data[0])
            } else {
              console.log(`⚠️ [DEBUG] No product-specific suggestions, API response:`, response.data)
              response = null
            }
          } catch (err) {
            console.log(`❌ [DEBUG] Product-specific API failed:`, err.response?.data || err.message)
            response = null
          }
        } else {
          console.log(`⚠️ [DEBUG] No productId provided, productId:`, productId)
        }

        if (!response && targetCategory) {
          console.log(`🔍 Fetching category-based suggested drinks for category: ${targetCategory}`)
          try {
            response = await axios.get(`${url}/api/food/suggested-drinks/${encodeURIComponent(targetCategory)}`)
            if (response.data.success && response.data.data && response.data.data.length > 0) {
              suggestionMethod = "category-based"
              console.log(`✅ Category-based suggestions found: ${response.data.data.length} drinks`)
            }
          } catch (err) {
            console.log(`❌ Category-based API failed:`, err.message)
            response = null
          }
        }

        if (!response || !response.data.success || !response.data.data || response.data.data.length === 0) {
          console.log(`🔄 No specific suggestions found, loading random drinks`)
          try {
            const fallbackResponse = await axios.get(`${url}/api/food/list`)
            if (fallbackResponse.data.success) {
              const allDrinks = fallbackResponse.data.data.filter(
                (item) => item.category && item.category.toLowerCase().includes("uống"),
              )
              const randomDrinks = allDrinks.slice(0, 4).map((drink) => ({
                ...drink,
                suggestionType: "random",
              }))
              setSuggestedDrinks(randomDrinks)
              setSuggestionType("random")
              console.log("✅ Loaded random drinks:", randomDrinks.length)
            }
          } catch (finalErr) {
            console.error("❌ Final fallback failed:", finalErr)
            setError("Không thể tải gợi ý đồ uống")
          }
        } else {
          setSuggestedDrinks(response.data.data)
          setSuggestionType(suggestionMethod)
          console.log(`✅ Successfully loaded ${suggestionMethod} drinks:`, response.data.data.length)
        }
      } catch (err) {
        console.error("❌ Error fetching suggested drinks:", err)
        setError("Không thể tải gợi ý đồ uống")
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedDrinks()
  }, [productId, targetCategory, url])

  const handleAddToCart = (drinkName) => {
    addToCart(drinkName, 1)
    toast.success(`Đã thêm ${drinkName} vào giỏ hàng`)
  }

  if (!productId && !targetCategory) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
        <div className="text-red-400 mb-2">⚠️ Lỗi: Không có thông tin sản phẩm</div>
        <div className="text-red-300 text-sm mb-2">
          Component SuggestedDrinks cần prop "productId" hoặc "productCategory"/"category"
        </div>
        <div className="text-red-200 text-xs">
          Props nhận được: {JSON.stringify({ productCategory, category, productId, productName, isCompact })}
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
          <p>Chưa có gợi ý đồ uống</p>
        </div>
      </div>
    )
  }

  const getSuggestionTitle = () => {
    switch (suggestionType) {
      case "product-specific":
        return `🥤 Đồ uống được gợi ý cho "${productName || "sản phẩm này"}"`
      case "category-based":
        return `🥤 Đồ uống được gợi ý cho danh mục "${targetCategory}"`
      case "random":
        return `🥤 Đồ uống phổ biến`
      default:
        return `🥤 Đồ uống được gợi ý`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">{getSuggestionTitle()}</h3>
        {suggestionType !== "random" && (
          <span className="text-slate-400 text-sm">
            {suggestionType === "product-specific" ? "Dựa trên sản phẩm cụ thể" : "Dựa trên danh mục"}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {suggestedDrinks.map((drink, index) => {
          return <SuggestedDrinkRowItem key={drink._id || index} item={drink} url={url} addToCart={addToCart} />
        })}
      </div>

      {error && <div className="text-center text-yellow-400 text-sm mt-4">⚠️ {error} - Hiển thị đồ uống ngẫu nhiên</div>}
    </div>
  )
}

export default SuggestedDrinks
