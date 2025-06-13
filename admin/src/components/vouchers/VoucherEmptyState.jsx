"use client"

import { Tag, Plus } from "lucide-react"

const VoucherEmptyState = ({ onAddClick }) => {
  return (
    <div className="text-center py-12 bg-gray-50 dark:bg-dark-lighter rounded-xl">
      <Tag size={64} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">Chưa có mã giảm giá nào</h3>
      <p className="text-gray-400 dark:text-gray-500 mb-6">Hãy thêm mã giảm giá đầu tiên của bạn</p>
      <button
        onClick={onAddClick}
        className="bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-lg flex items-center transition-colors mx-auto"
      >
        <Plus size={20} className="mr-2" />
        Thêm mã giảm giá
      </button>
    </div>
  )
}

export default VoucherEmptyState
