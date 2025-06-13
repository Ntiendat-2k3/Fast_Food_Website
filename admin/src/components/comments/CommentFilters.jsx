"use client"
import { Search, Tag, Filter, RefreshCw } from "lucide-react"

const CommentFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories,
  fetchComments,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng, nội dung hoặc sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Category Filter */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chưa duyệt</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchComments}
            className="p-2.5 bg-gray-100 dark:bg-dark-lighter rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark transition-colors w-full sm:w-auto"
            title="Refresh"
          >
            <RefreshCw size={20} className="mx-auto sm:mx-0" />
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {(categoryFilter !== "all" || statusFilter !== "all" || searchTerm) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-4 rounded-lg mb-6">
          <p className="font-medium">Bộ lọc hiện tại:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                Danh mục: {categoryFilter}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                Trạng thái: {statusFilter === "approved" ? "Đã duyệt" : "Chưa duyệt"}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                Tìm kiếm: {searchTerm}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default CommentFilters
