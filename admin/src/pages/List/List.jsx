"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import EditFoodModal from "./EditFoodModal"
import Pagination from "../../components/Pagination"
import ConfirmModal from "../../components/ConfirmModal"

// Import new components
import ProductSearchBar from "../../components/products/ProductSearchBar"
import CategoryFilter from "../../components/products/CategoryFilter"
import DeleteModeBar from "../../components/products/DeleteModeBar"
import DeleteModeNotice from "../../components/products/DeleteModeNotice"
import ProductGrid from "../../components/products/ProductGrid"

const List = ({ url }) => {
  const [list, setList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentFood, setCurrentFood] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, itemId: null })

  // Chế độ xóa nhiều
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredItems, setFilteredItems] = useState([])
  const itemsPerPage = 10

  const fetchList = async (category = "Tất cả") => {
    setLoading(true)
    try {
      let apiUrl = `${url}/api/food/list`

      // Add category filter if not "Tất cả"
      if (category !== "Tất cả") {
        apiUrl += `?category=${encodeURIComponent(category)}`
      }

      const response = await axios.get(apiUrl)
      if (response.data.success) {
        setList(response.data.data)
      } else {
        toast.error("Error fetching products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Error connecting to server")
    } finally {
      setLoading(false)
    }
  }

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId })
      if (response.data.success) {
        await fetchList(selectedCategory)
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message || "Lỗi khi xóa sản phẩm")
      }
    } catch (error) {
      console.error("Error removing product:", error)
      toast.error(error.response?.data?.message || "Lỗi kết nối đến máy chủ")
    }
  }

  useEffect(() => {
    fetchList(selectedCategory)
  }, [selectedCategory])

  useEffect(() => {
    // Filter items based on search term
    let filtered = list
    if (searchTerm.trim() !== "") {
      filtered = list.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredItems(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [list, searchTerm])

  // Get current page items
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem)
  }

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled by useEffect, no need for additional logic here
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSearchTerm("")
    setCurrentPage(1)
  }

  const handleEditClick = (food) => {
    setCurrentFood(food)
    setEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    fetchList(selectedCategory)
    setEditModalOpen(false)
    setCurrentFood(null)
  }

  const handleDeleteClick = (foodId) => {
    setConfirmModal({
      isOpen: true,
      itemId: foodId,
      isBulk: false,
      count: 0,
    })
  }

  const handleConfirmDelete = () => {
    if (confirmModal.isBulk) {
      handleConfirmBulkDelete()
    } else if (confirmModal.itemId) {
      removeFood(confirmModal.itemId)
      setConfirmModal({ isOpen: false, itemId: null, isBulk: false, count: 0 })
    }
  }

  // Bật/tắt chế độ xóa nhiều
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode)
    setSelectedItems([])
  }

  // Chọn/bỏ chọn sản phẩm khi ở chế độ xóa
  const toggleSelectItem = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  // Xác nhận xóa nhiều sản phẩm
  const confirmBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để xóa")
      return
    }

    setConfirmModal({
      isOpen: true,
      itemId: null,
      isBulk: true,
      count: selectedItems.length,
    })
  }

  const handleConfirmBulkDelete = async () => {
    try {
      const response = await axios.post(`${url}/api/food/remove-multiple`, {
        ids: selectedItems,
      })

      if (response.data.success) {
        await fetchList(selectedCategory)
        setSelectedItems([])
        setDeleteMode(false)
        toast.success(`Đã xóa ${selectedItems.length} sản phẩm`)
      } else {
        toast.error(response.data.message || "Lỗi khi xóa sản phẩm")
      }
    } catch (error) {
      console.error("Error removing products:", error)
      toast.error(error.response?.data?.message || "Lỗi kết nối đến máy chủ")
    }

    setConfirmModal({ isOpen: false, itemId: null, isBulk: false, count: 0 })
  }

  const currentItems = getCurrentItems()

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-3 md:p-6 mb-4 md:mb-8">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Danh sách sản phẩm</h1>

          {/* Delete mode controls */}
          <DeleteModeBar
            deleteMode={deleteMode}
            selectedItemsCount={selectedItems.length}
            toggleDeleteMode={toggleDeleteMode}
            confirmBulkDelete={confirmBulkDelete}
          />
        </div>

        {/* Delete mode notice */}
        <DeleteModeNotice isVisible={deleteMode} />

        <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Search Bar */}
          <ProductSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} />

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
            refreshList={() => fetchList(selectedCategory)}
            url={url}
          />
        </div>

        {/* Product Grid */}
        <ProductGrid
          loading={loading}
          items={currentItems}
          url={url}
          deleteMode={deleteMode}
          selectedItems={selectedItems}
          toggleSelectItem={toggleSelectItem}
          handleEditClick={handleEditClick}
          handleDeleteClick={handleDeleteClick}
        />

        {/* Pagination */}
        <div className="px-3 md:px-0 mt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      {/* Edit Food Modal */}
      {editModalOpen && currentFood && (
        <EditFoodModal
          food={currentFood}
          url={url}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, itemId: null, isBulk: false, count: 0 })}
        onConfirm={handleConfirmDelete}
        title={confirmModal.isBulk ? "Xác nhận xóa nhiều sản phẩm" : "Xác nhận xóa"}
        message={
          confirmModal.isBulk
            ? `Bạn có chắc chắn muốn xóa ${confirmModal.count} sản phẩm đã chọn? Hành động này không thể hoàn tác.`
            : "Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        }
      />
    </div>
  )
}

export default List
