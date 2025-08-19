"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const useSuggestedFoods = (productId = null, drinkName = null, url) => {
  const [suggestedFoods, setSuggestedFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSuggestedFoods = async () => {
      if (!productId && !drinkName) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        let response

        if (productId) {
          console.log(`🔍 Fetching product-specific foods for product ID: ${productId}`)
          response = await axios.get(`${url}/api/food/suggested-foods-by-product/${productId}`)
        } else if (drinkName) {
          console.log(`🔍 Fetching drink-based foods for drink: ${drinkName}`)
          response = await axios.get(`${url}/api/food/suggested-foods/${encodeURIComponent(drinkName)}`)
        }

        if (response?.data?.success && response.data.data) {
          setSuggestedFoods(response.data.data)
          console.log(`✅ Successfully loaded ${response.data.data.length} suggested foods`)
          console.log(`📊 Recommendation type: ${response.data.data[0]?.recommendationType || "unknown"}`)
        } else {
          console.log("❌ Error from API:", response?.data?.message)
          setError(response?.data?.message || "Không thể tải gợi ý món ăn")
          setSuggestedFoods([])
        }
      } catch (err) {
        console.error("❌ Error fetching suggested foods:", err)
        setError("Không thể tải gợi ý món ăn")
        setSuggestedFoods([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedFoods()
  }, [productId, drinkName, url])

  return { suggestedFoods, loading, error }
}

export default useSuggestedFoods
