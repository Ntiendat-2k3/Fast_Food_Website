"use client"
import { Filter, RefreshCw } from "lucide-react"

const CategoryFilter = ({ selectedCategory, handleCategoryChange, refreshList }) => {
  const categories = ["Tất cả", "Burger", "Burito", "Gà", "Hot dog", "Pasta", "Salad", "Sandwich", "Tart"]

  return (
    <div className="flex items-center">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={refreshList}
        className="ml-2 p-2.5 bg-gray-100 dark:bg-dark-lighter rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark transition-colors flex-shrink-0"
        title="Refresh"
      >
        <RefreshCw size={20} />
      </button>
    </div>
  )
}

export default CategoryFilter
