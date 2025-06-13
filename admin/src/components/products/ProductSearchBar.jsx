"use client"
import { Search } from "lucide-react"

const ProductSearchBar = ({ searchTerm, setSearchTerm, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-0 px-3 flex items-center bg-primary rounded-r-lg text-dark"
      >
        Tìm
      </button>
    </form>
  )
}

export default ProductSearchBar
