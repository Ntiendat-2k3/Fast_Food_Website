"use client"

import { Trash2, UserX } from "lucide-react"
import ImageWithFallback from "../common/ImageWithFallback" // Reusing existing component

const CustomerTable = ({ customers, loading, onDelete, url }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-dark-lighter rounded-xl">
        <UserX size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Không tìm thấy khách hàng nào.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-dark-lighter rounded-xl shadow-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Khách hàng</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Ngày đăng ký</th>
            <th className="py-3 px-6 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 dark:text-gray-200 text-sm font-light">
          {customers.map((customer) => (
            <tr
              key={customer._id}
              className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="flex items-center">
                  <ImageWithFallback
                    src={customer.avatar ? customer.avatar : `${url}/images/profile_placeholder.png`}
                    fallbackSrc={`${url}/images/profile_placeholder.png`}
                    alt={customer.name}
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                  />
                  <span className="font-medium">{customer.name}</span>
                </div>
              </td>
              <td className="py-3 px-6 text-left">{customer.email}</td>
              <td className="py-3 px-6 text-left">{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</td>
              <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center">
                  <button
                    onClick={() => onDelete(customer)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-200"
                    title="Xóa khách hàng"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CustomerTable
