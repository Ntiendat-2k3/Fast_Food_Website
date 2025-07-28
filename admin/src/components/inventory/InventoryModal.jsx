"use client"

import { useState, useEffect } from "react"
import { X, Package, Save } from "lucide-react"

const InventoryModal = ({ isOpen, onClose, item, onSave }) => {
  const [formData, setFormData] = useState({
    quantity: 0,
    minStockLevel: 10,
    maxStockLevel: 1000,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        quantity: item.quantity || 0,
        minStockLevel: item.minStockLevel || 10,
        maxStockLevel: item.maxStockLevel || 1000,
      })
    }
  }, [item])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        foodId: item.foodId._id,
        ...formData,
        updatedBy: "admin",
      })
      onClose()
    } catch (error) {
      console.error("Error saving inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number.parseInt(value) || 0,
    }))
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Package className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">Cập nhật kho hàng</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Info */}
          <div className="flex items-center mb-6 p-4 bg-gray-50 dark:bg-dark rounded-lg">
            <img
              src={item.foodId?.image ? `/images/${item.foodId.image}` : "/placeholder.svg"}
              alt={item.foodId?.name}
              className="h-16 w-16 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = "/placeholder.svg"
              }}
            />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.foodId?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.foodId?.category}</p>
              <p className="text-sm font-medium text-primary">{item.foodId?.price?.toLocaleString("vi-VN")} đ</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số lượng tồn kho *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark text-gray-900 dark:text-white"
                placeholder="Nhập số lượng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mức tồn kho tối thiểu *
              </label>
              <input
                type="number"
                name="minStockLevel"
                value={formData.minStockLevel}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark text-gray-900 dark:text-white"
                placeholder="Nhập mức tối thiểu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mức tồn kho tối đa *
              </label>
              <input
                type="number"
                name="maxStockLevel"
                value={formData.maxStockLevel}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark text-gray-900 dark:text-white"
                placeholder="Nhập mức tối đa"
              />
            </div>

            {/* Current Status */}
            <div className="p-4 bg-gray-50 dark:bg-dark rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Trạng thái hiện tại</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Tồn kho:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {item.quantity?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>
                  <span
                    className={`ml-2 font-medium ${
                      item.status === "in_stock"
                        ? "text-green-600"
                        : item.status === "low_stock"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {item.status === "in_stock" ? "Còn hàng" : item.status === "low_stock" ? "Sắp hết" : "Hết hàng"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InventoryModal
