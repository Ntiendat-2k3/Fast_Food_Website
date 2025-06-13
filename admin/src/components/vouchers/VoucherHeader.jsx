"use client"

import { Plus } from "lucide-react"

const VoucherHeader = ({ onAddClick }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý mã giảm giá</h1>
      <button
        onClick={onAddClick}
        className="bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-lg flex items-center transition-colors"
      >
        <Plus size={20} className="mr-2" />
        Thêm mã giảm giá
      </button>
    </div>
  )
}

export default VoucherHeader
