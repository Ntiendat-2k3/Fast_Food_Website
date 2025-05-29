"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Tag, Plus, Edit, Trash2, Calendar, DollarSign, Percent } from "lucide-react"
import VoucherModal from "./VoucherModal"
import ConfirmModal from "../../components/ConfirmModal"

const Vouchers = ({ url }) => {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentVoucher, setCurrentVoucher] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, voucherId: null })

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/voucher/list`)
      if (response.data.success) {
        setVouchers(response.data.data)
      } else {
        toast.error("Lỗi khi tải danh sách voucher")
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const handleAddVoucher = () => {
    setCurrentVoucher(null)
    setModalOpen(true)
  }

  const handleEditVoucher = (voucher) => {
    setCurrentVoucher(voucher)
    setModalOpen(true)
  }

  const handleDeleteClick = (voucherId) => {
    setConfirmModal({
      isOpen: true,
      voucherId: voucherId,
    })
  }

  const handleConfirmDelete = async () => {
    if (confirmModal.voucherId) {
      try {
        const response = await axios.post(`${url}/api/voucher/delete`, { id: confirmModal.voucherId })
        if (response.data.success) {
          toast.success("Xóa voucher thành công")
          fetchVouchers()
        } else {
          toast.error(response.data.message || "Lỗi khi xóa voucher")
        }
      } catch (error) {
        console.error("Error deleting voucher:", error)
        toast.error("Lỗi kết nối đến máy chủ")
      }
    }
    setConfirmModal({ isOpen: false, voucherId: null })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

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
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-custom p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý mã giảm giá</h1>
          <button
            onClick={handleAddVoucher}
            className="bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Thêm mã giảm giá
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : vouchers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-lighter">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mã giảm giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sử dụng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-lighter">
                {vouchers.map((voucher) => (
                  <tr key={voucher._id} className="hover:bg-gray-50 dark:hover:bg-dark-lighter">
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
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(voucher.startDate)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            đến {formatDate(voucher.endDate)}
                          </div>
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
                          onClick={() => handleEditVoucher(voucher)}
                          className="p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors"
                          title="Sửa voucher"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(voucher._id)}
                          className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                          title="Xóa voucher"
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
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-dark-lighter rounded-xl">
            <Tag size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">Chưa có mã giảm giá nào</h3>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Hãy thêm mã giảm giá đầu tiên của bạn</p>
            <button
              onClick={handleAddVoucher}
              className="bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-lg flex items-center transition-colors mx-auto"
            >
              <Plus size={20} className="mr-2" />
              Thêm mã giảm giá
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <VoucherModal
          url={url}
          voucher={currentVoucher}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            fetchVouchers()
            setModalOpen(false)
          }}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, voucherId: null })}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
      />
    </div>
  )
}

export default Vouchers
