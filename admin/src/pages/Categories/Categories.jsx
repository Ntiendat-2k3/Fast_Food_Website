"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from "lucide-react"
import CategoryModal from "./CategoryModal"
import ConfirmModal from "../../components/ConfirmModal"

const Categories = ({ url }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, categoryId: null })

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/category/list`)
      if (response.data.success) {
        setCategories(response.data.data)
      } else {
        toast.error("Lỗi khi tải danh sách danh mục")
      }
    } catch (error) {
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setModalOpen(true)
  }

  const handleDeleteCategory = (categoryId) => {
    setConfirmModal({ isOpen: true, categoryId })
  }

  const confirmDelete = async () => {
    try {
      const response = await axios.post(`${url}/api/category/remove`, {
        id: confirmModal.categoryId,
      })

      if (response.data.success) {
        toast.success(response.data.message)
        fetchCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error("Lỗi khi xóa danh mục")
    }
    setConfirmModal({ isOpen: false, categoryId: null })
  }

  const toggleCategoryStatus = async (categoryId) => {
    try {
      const response = await axios.post(`${url}/api/category/toggle-status`, {
        id: categoryId,
      })

      if (response.data.success) {
        toast.success(response.data.message)
        fetchCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái danh mục")
    }
  }

  const handleModalSuccess = () => {
    fetchCategories()
    setModalOpen(false)
    setEditingCategory(null)
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-dark-light md:rounded-2xl md:shadow-custom p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý danh mục</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý các danh mục sản phẩm của cửa hàng</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-primary hover:bg-primary-dark text-dark font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Thêm danh mục
          </button>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Thứ tự</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Icon</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Tên danh mục</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Mô tả</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Trạng thái</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <tr
                    key={category._id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="text-gray-400 cursor-move" size={16} />
                        <span className="text-gray-600 dark:text-gray-400">{category.order || index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-2xl">{category.icon}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {category.description || "Không có mô tả"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleCategoryStatus(category._id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          category.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {category.isActive ? (
                          <>
                            <Eye size={14} />
                            Hiển thị
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            Ẩn
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Chưa có danh mục nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <CategoryModal
          category={editingCategory}
          url={url}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, categoryId: null })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
      />
    </div>
  )
}

export default Categories
