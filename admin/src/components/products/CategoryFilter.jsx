"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Filter, RefreshCw } from "lucide-react"

const CategoryFilter = ({ selectedCategory, handleCategoryChange, refreshList, url }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/category/list`)
      if (response.data.success) {
        setCategories(response.data.data)
      } else {
        console.error("Failed to fetch categories:", response.data.message)
        // Fallback to default categories if API fails
        setCategories([
          { name: "Burger", _id: "burger" },
          { name: "Burito", _id: "burito" },
          { name: "Gà", _id: "ga" },
          { name: "Hot dog", _id: "hotdog" },
          { name: "Pasta", _id: "pasta" },
          { name: "Salad", _id: "salad" },
          { name: "Sandwich", _id: "sandwich" },
          { name: "Tart", _id: "tart" },
        ])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Fallback to default categories if API fails
      setCategories([
        { name: "Burger", _id: "burger" },
        { name: "Burito", _id: "burito" },
        { name: "Gà", _id: "ga" },
        { name: "Hot dog", _id: "hotdog" },
        { name: "Pasta", _id: "pasta" },
        { name: "Salad", _id: "salad" },
        { name: "Sandwich", _id: "sandwich" },
        { name: "Tart", _id: "tart" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const allCategories = [{ name: "Tất cả", _id: "all" }, ...categories]

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="pl-10 pr-4 py-2.5 bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
          disabled={loading}
        >
          {allCategories.map((category) => (
            <option key={category._id || category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => {
          fetchCategories()
          refreshList()
        }}
        className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0"
        title="Làm mới"
        disabled={loading}
      >
        <RefreshCw size={18} className={`text-gray-600 dark:text-gray-400 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  )
}

export default CategoryFilter
