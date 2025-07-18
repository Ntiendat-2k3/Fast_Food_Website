"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const useSuggestedDrinks = (category, url) => {
  const [drinks, setDrinks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSuggestedDrinks = async () => {
      if (!category || !url) return

      setIsLoading(true)
      setError(null)

      try {
        console.log(`Fetching suggested drinks for category: ${category}`)
        const response = await axios.get(`${url}/api/food/suggested-drinks/${encodeURIComponent(category)}?limit=4`)

        console.log("API Response:", response.data)

        if (response.data.success) {
          setDrinks(response.data.data)
        } else {
          setError(response.data.message || "Không thể tải gợi ý đồ uống")
        }
      } catch (error) {
        console.error("Error fetching suggested drinks:", error)
        setError("Lỗi khi tải gợi ý đồ uống")

        // Fallback: load random drinks if suggested drinks fail
        try {
          console.log("Trying fallback - loading random drinks")
          const fallbackResponse = await axios.get(`${url}/api/food/category/Đồ uống`)
          if (fallbackResponse.data.success) {
            console.log("Fallback successful, got drinks:", fallbackResponse.data.data.length)
            setDrinks(fallbackResponse.data.data.slice(0, 4))
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestedDrinks()
  }, [category, url])

  return { drinks, isLoading, error }
}

export default useSuggestedDrinks
