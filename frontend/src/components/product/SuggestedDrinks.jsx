"use client"

import { useContext, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "../../context/StoreContext"
import SuggestedDrinkRowItem from "./SuggestedDrinkRowItem"
import LoadingSpinner from "../common/LoadingSpinner"
import EmptyState from "../common/EmptyState"
import { slugify } from "../../utils/slugify"
import axios from "axios"

const SuggestedDrinks = ({ productCategory, category, isCompact = false }) => {
  const { url, addToCart } = useContext(StoreContext)
  const navigate = useNavigate()

  const [drinks, setDrinks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  // Use productCategory first, then fallback to category prop
  const targetCategory = productCategory || category

  useEffect(() => {
    const fetchData = async () => {
      if (!targetCategory || !url) {
        console.log("❌ Missing category or URL:", { targetCategory, url })
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log(`🔍 Fetching suggested drinks for category: "${targetCategory}"`)

        // First get debug info
        const debugResponse = await axios.get(
          `${url}/api/food/debug-suggested-drinks/${encodeURIComponent(targetCategory)}`,
        )
        console.log("🐛 Debug info:", debugResponse.data)
        setDebugInfo(debugResponse.data.debug)

        // Then get suggested drinks
        const response = await axios.get(
          `${url}/api/food/suggested-drinks/${encodeURIComponent(targetCategory)}?limit=4`,
        )
        console.log("🍹 Suggested drinks response:", response.data)

        if (response.data.success) {
          setDrinks(response.data.data)
          console.log("✅ Successfully loaded drinks:", response.data.data.length)
        } else {
          setError(response.data.message || "Không thể tải gợi ý đồ uống")
          console.log("❌ Error from API:", response.data.message)
        }
      } catch (error) {
        console.error("💥 Error fetching suggested drinks:", error)
        setError("Lỗi khi tải gợi ý đồ uống")

        // Fallback: load random drinks
        try {
          console.log("🔄 Trying fallback - loading random drinks")
          const fallbackResponse = await axios.get(`${url}/api/food/category/Đồ uống`)
          if (fallbackResponse.data.success) {
            console.log("✅ Fallback successful, got drinks:", fallbackResponse.data.data.length)
            setDrinks(fallbackResponse.data.data.slice(0, 4))
            setError(null) // Clear error since fallback worked
          }
        } catch (fallbackError) {
          console.error("💥 Fallback error:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [targetCategory, url])

  // Show debug info if category is missing
  if (!targetCategory) {
    return (
      <div className="text-center py-4 bg-red-900/20 rounded-lg border border-red-500/30">
        <p className="text-red-400 text-sm font-semibold">⚠️ Lỗi: Không có category</p>
        <p className="text-red-300 text-xs mt-1">
          Component SuggestedDrinks cần prop "productCategory" hoặc "category"
        </p>
        <div className="text-xs text-gray-400 mt-2">
          <p>Props nhận được:</p>
          <pre className="text-left bg-gray-800 p-2 rounded mt-1 text-xs">
            {JSON.stringify({ productCategory, category }, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <LoadingSpinner />
        <span className="ml-2 text-gray-400 text-sm">Đang tải gợi ý cho {targetCategory}...</span>
      </div>
    )
  }

  if (error && drinks.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
        {debugInfo && (
          <div className="mt-2 text-xs text-gray-400 bg-gray-800 p-2 rounded">
            <p>
              Debug: {debugInfo.totalOrders} orders, {debugInfo.categoryFoods} category foods, {debugInfo.drinks} drinks
            </p>
            <p>Categories: {debugInfo.allCategories?.join(", ")}</p>
            <p>
              Orders with {targetCategory}: {debugInfo.ordersWithCategory}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!drinks || drinks.length === 0) {
    return (
      <EmptyState
        title="Không có đồ uống gợi ý"
        description={`Hiện tại không có đồ uống nào được gợi ý cho danh mục ${targetCategory}.`}
        className="py-4"
      />
    )
  }

  const displayDrinks = isCompact ? drinks.slice(0, 2) : drinks

  return (
    <section className={`${isCompact ? "py-4" : "py-8"}`}>
      <div className="text-center mb-4">
        <h3 className={`${isCompact ? "text-xl" : "text-2xl"} font-bold text-white mb-2`}>
          Đồ uống được mua cùng {targetCategory}
        </h3>
        <p className="text-gray-300 text-sm">
          Những đồ uống phổ biến nhất được khách hàng chọn cùng với {targetCategory}
        </p>
        {debugInfo && (
          <p className="text-xs text-gray-500 mt-1">
            Debug: {debugInfo.ordersWithCategory} orders found with {targetCategory}
          </p>
        )}
      </div>

      <motion.div
        className="flex flex-col gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {displayDrinks.map((item, index) => (
          <motion.div
            key={item._id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="relative"
          >
            <SuggestedDrinkRowItem item={item} url={url} addToCart={addToCart} />
            {item.purchaseCount && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Đã mua {item.purchaseCount} lần
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {isCompact && drinks.length > displayDrinks.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => navigate(`/foods?category=${slugify("Đồ uống")}`)}
            className="text-primary hover:underline text-sm font-semibold transition-colors duration-200"
          >
            Xem thêm đồ uống khác ({drinks.length - displayDrinks.length} sản phẩm)
          </button>
        </div>
      )}
    </section>
  )
}

export default SuggestedDrinks
