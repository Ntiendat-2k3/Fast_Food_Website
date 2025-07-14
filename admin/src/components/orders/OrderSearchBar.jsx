"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

const OrderSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, onSearch])

  const handleClear = () => {
    setSearchTerm("")
    onSearch("")
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-10 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
        placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, số điện thoại..."
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default OrderSearchBar
