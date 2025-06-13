"use client"
import { X, Check, Trash2 } from "lucide-react"

const DeleteModeBar = ({ deleteMode, selectedItemsCount, toggleDeleteMode, confirmBulkDelete }) => {
  return deleteMode ? (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Đã chọn: <span className="font-medium text-primary">{selectedItemsCount}</span>
      </span>
      <button
        onClick={toggleDeleteMode}
        className="px-3 py-1.5 bg-gray-200 dark:bg-dark-lighter text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark transition-colors flex items-center space-x-1"
      >
        <X size={16} />
        <span>Hủy</span>
      </button>
      <button
        onClick={confirmBulkDelete}
        disabled={selectedItemsCount === 0}
        className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${
          selectedItemsCount === 0
            ? "bg-red-300 text-white cursor-not-allowed"
            : "bg-red-500 text-white hover:bg-red-600"
        } transition-colors`}
      >
        <Check size={16} />
        <span>Xác nhận xóa ({selectedItemsCount})</span>
      </button>
    </div>
  ) : (
    <button
      onClick={toggleDeleteMode}
      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
    >
      <Trash2 size={16} />
      <span>Xóa</span>
    </button>
  )
}

export default DeleteModeBar
