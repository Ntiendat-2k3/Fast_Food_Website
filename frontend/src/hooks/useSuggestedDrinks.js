"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const useSuggestedDrinks = (category, url, productId = null) => {
  const [drinks, setDrinks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestionType, setSuggestionType] = useState("loading")

  useEffect(() => {
    const fetchSuggestedDrinks = async () => {
      if ((!category && !productId) || !url) return

      setIsLoading(true)
      setError(null)
      setSuggestionType("loading")

      try {
        let response
        let suggestionMethod = "random"

        if (productId) {
          console.log(`Fetching product-specific suggested drinks for product ID: ${productId}`)
          try {
            response = await axios.get(`${url}/api/food/suggested-drinks-by-product/${productId}`)
            if (response.data.success && response.data.data && response.data.data.length > 0) {
              suggestionMethod = response.data.data[0]?.suggestionType || "product-specific"
              console.log("Product-specific API Response:", response.data)
            } else {
              response = null
            }
          } catch (err) {
            console.log("Product-specific API failed, trying category fallback:", err.message)
            response = null
          }
        }

        if (!response && category) {
          console.log(`Fetching category-based suggested drinks for category: ${category}`)
          response = await axios.get(`${url}/api/food/suggested-drinks/${encodeURIComponent(category)}?limit=4`)
          if (response.data.success && response.data.data && response.data.data.length > 0) {
            suggestionMethod = "category-based"
            console.log("Category-based API Response:", response.data)
          }
        }

        if (response && response.data.success) {
          setDrinks(response.data.data)
          setSuggestionType(suggestionMethod)
        } else {
          setError(response?.data?.message || "Không thể tải gợi ý đồ uống")
        }
      } catch (error) {
        console.error("Error fetching suggested drinks:", error)
        setError("Lỗi khi tải gợi ý đồ uống")

        try {
          console.log("Trying fallback - loading random drinks")
          const fallbackResponse = await axios.get(`${url}/api/food/category/Đồ uống`)
          if (fallbackResponse.data.success) {
            console.log("Fallback successful, got drinks:", fallbackResponse.data.data.length)
            const randomDrinks = fallbackResponse.data.data.slice(0, 4).map((drink) => ({
              ...drink,
              suggestionType: "random",
            }))
            setDrinks(randomDrinks)
            setSuggestionType("random")
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestedDrinks()
  }, [category, url, productId])

  return { drinks, isLoading, error, suggestionType }
}

export default useSuggestedDrinks
