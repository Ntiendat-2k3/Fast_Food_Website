"use client"

import { X } from "lucide-react"

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 dark:bg-dark-lighter rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-dark"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
