"use client"

import { useContext, useState, useEffect, useRef } from "react"
import { StoreContext } from "../context/StoreContext"
import FoodItem from "./FoodItem"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Grid3X3, List, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const FoodDisplay = ({ category }) => {
  const { food_list, url } = useContext(StoreContext)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [ratings, setRatings] = useState({}) // Assuming ratings are fetched or calculated elsewhere
  const [loading, setLoading] = useState(true)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Ref for scrolling to food display section
  const foodDisplayRef = useRef(null)

  // Simulate loading
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [category])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [category, searchTerm, sortBy, priceRange])

  // Filter and sort food items
  const filteredAndSortedFood = food_list
    .filter((item) => {
      const matchesCategory = category === "All" || item.category === category
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1]
      return matchesCategory && matchesSearch && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          // Placeholder for actual rating logic if available
          return (ratings[b._id] || 0) - (ratings[a._id] || 0)
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // Calculate pagination
  const totalItems = filteredAndSortedFood.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAndSortedFood.slice(startIndex, endIndex)

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to food display section instead of top
      if (foodDisplayRef.current) {
        foodDisplayRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        })
      }
    }
  }

  const goToPrevious = () => goToPage(currentPage - 1)
  const goToNext = () => goToPage(currentPage + 1)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Animation variants for smoother entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 18,
        mass: 0.8,
      },
    },
  }

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl overflow-hidden border border-slate-700 animate-pulse">
      <div className="h-48 sm:h-56 bg-slate-700/50"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-10 w-10 bg-slate-700/50 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  // Pagination Component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-center gap-2 mt-8 mb-4"
      >
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && goToPage(page)}
              disabled={page === "..."}
              className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                page === currentPage
                  ? "bg-primary text-slate-900 font-semibold"
                  : page === "..."
                    ? "text-gray-400 cursor-default"
                    : "bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-700/50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight size={16} />
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6" ref={foodDisplayRef}>
      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 min-w-[160px]"
            >
              <option value="name">Tên A-Z</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>

          {/* View Mode Toggle - Hidden on mobile */}
          <div className="hidden md:flex bg-slate-700/50 rounded-xl p-1 border border-slate-600">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === "grid" ? "bg-primary text-slate-900" : "text-gray-400 hover:text-white"
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === "list" ? "bg-primary text-slate-900" : "text-gray-400 hover:text-white"
              }`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white hover:bg-slate-700 transition-all duration-300"
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Bộ lọc</span>
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-700 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Khoảng giá</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Từ"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Đến"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 200000])}
                        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Quick Price Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Lọc nhanh</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Dưới 50k", range: [0, 50000] },
                        { label: "50k - 100k", range: [50000, 100000] },
                        { label: "Trên 100k", range: [100000, 200000] },
                      ].map((filter) => (
                        <button
                          key={filter.label}
                          onClick={() => setPriceRange(filter.range)}
                          className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Count and Pagination Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, ease: "easeOut" }}
        className="flex items-center justify-between text-gray-300"
      >
        <p className="text-sm">
          Hiển thị{" "}
          <span className="text-primary font-medium">
            {startIndex + 1}-{Math.min(endIndex, totalItems)}
          </span>{" "}
          trong tổng số <span className="text-primary font-medium">{totalItems}</span> món ăn
          {category !== "All" && (
            <>
              {" "}
              trong danh mục <span className="text-primary font-medium">{category}</span>
            </>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-sm">
            Trang <span className="text-primary font-medium">{currentPage}</span> /{" "}
            <span className="text-primary font-medium">{totalPages}</span>
          </p>
        )}
      </motion.div>

      {/* Food Grid/List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`grid lg:gap-4 sm:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" // 2 columns on mobile, 3 on tablet, 4 on desktop
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </motion.div>
        ) : currentItems.length > 0 ? (
          <motion.div
            key={`content-${currentPage}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-2 lg:gap-4 sm:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" // 2 columns on mobile, 3 on tablet, 4 on desktop
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}
          >
            {currentItems.map((item, index) => (
              <motion.div key={`${item._id}-${currentPage}`} variants={itemVariants}>
                <FoodItem
                  _id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  index={startIndex + index}
                  rating={ratings[item._id] || 0}
                  totalReviews={0}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-center py-12"
          >
            <div className="bg-slate-800/30 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy món ăn</h3>
              <p className="text-gray-400 mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy món ăn phù hợp.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setPriceRange([0, 200000])
                  setCurrentPage(1)
                }}
                className="bg-primary hover:bg-primary-dark text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <PaginationComponent />
    </div>
  )
}

export default FoodDisplay
