"use client"

import { Tag, Edit, Trash2, Calendar, DollarSign, Percent } from "lucide-react"

const VoucherTableRow = ({ voucher, onEdit, onDelete, formatDate }) => {
  const isVoucherActive = (voucher) => {
    const now = new Date()
    const startDate = new Date(voucher.startDate)
    const endDate = new Date(voucher.endDate)

    return (
      voucher.isActive &&
      now >= startDate &&
      now <= endDate &&
      (voucher.usageLimit === 0 || voucher.usageCount < voucher.usageLimit)
    )
  }

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-lighter">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Tag className="text-primary mr-2" size={18} />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{voucher.code}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{voucher.description}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {voucher.discountType === "percentage" ? (
            <Percent className="text-green-500 mr-2" size={18} />
          ) : (
            <DollarSign className="text-blue-500 mr-2" size={18} />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {voucher.discountType === "percentage"
                ? `${voucher.discountValue}%`
                : `${voucher.discountValue.toLocaleString("vi-VN")}đ`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {voucher.minOrderValue > 0
                ? `Đơn tối thiểu: ${voucher.minOrderValue.toLocaleString("vi-VN")}đ`
                : "Không giới hạn đơn tối thiểu"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar className="text-orange-500 mr-2" size={18} />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(voucher.startDate)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">đến {formatDate(voucher.endDate)}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {voucher.usageCount} / {voucher.usageLimit > 0 ? voucher.usageLimit : "∞"}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {isVoucherActive(voucher) ? (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Đang hoạt động
          </span>
        ) : (
          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Không hoạt động
          </span>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(voucher)}
            className="p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors"
            title="Sửa voucher"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(voucher._id)}
            className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
            title="Xóa voucher"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default VoucherTableRow
