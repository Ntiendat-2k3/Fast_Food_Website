"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Grid3X3, List, ChevronDown } from "lucide-react"
import Input from "../common/Input"
import Button from "../common/Button"

const FoodFilters = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  priceRange,
  onPriceRangeChange,
  showFilters,
  onToggleFilters,
  className = "",
}) => {
  const sortOptions = [
    { value: "name", label: "Tên A-Z" },
    { value: "price-low", label: "Giá thấp đến cao" },
    { value: "price-high", label: "Giá cao đến thấp" },
    { value: "rating", label: "Đánh giá cao nhất" },
  ]

  const quickPriceFilters = [
    { label: "Dưới 50k", range: [0, 50000] },
    { label: "50k - 100k", range: [50000, 100000] },
    { label: "Trên 100k", range: [100000, 200000] },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700 ${className}`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 min-w-[160px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-700/50 rounded-xl p-1 border border-slate-600">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === "grid" ? "bg-primary text-slate-900" : "text-gray-400 hover:text-white"
            }`}
            aria-label="Grid view"
          >
            <Grid3X3 size={18} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === "list" ? "bg-primary text-slate-900" : "text-gray-400 hover:text-white"
            }`}
            aria-label="List view"
          >
            <List size={18} />
          </button>
        </div>

        {/* Filter Toggle */}
        <Button onClick={onToggleFilters} variant="outline" icon={<Filter size={18} />}>
          <span className="hidden sm:inline">Bộ lọc</span>
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-slate-700 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Khoảng giá</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="Từ"
                      value={priceRange[0]}
                      onChange={(e) => onPriceRangeChange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                      className="text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      placeholder="Đến"
                      value={priceRange[1]}
                      onChange={(e) => onPriceRangeChange([priceRange[0], Number.parseInt(e.target.value) || 200000])}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Quick Price Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Lọc nhanh</label>
                  <div className="flex flex-wrap gap-2">
                    {quickPriceFilters.map((filter) => (
                      <Button
                        key={filter.label}
                        onClick={() => onPriceRangeChange(filter.range)}
                        variant="outline"
                        size="sm"
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default FoodFilters
