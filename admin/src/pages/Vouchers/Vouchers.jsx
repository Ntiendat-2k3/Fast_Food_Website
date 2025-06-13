"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import VoucherModal from "./VoucherModal"
import ConfirmModal from "../../components/ConfirmModal"
import VoucherHeader from "../../components/vouchers/VoucherHeader"
import VoucherTable from "../../components/vouchers/VoucherTable"
import VoucherLoadingState from "../../components/vouchers/VoucherLoadingState"
import VoucherEmptyState from "../../components/vouchers/VoucherEmptyState"

const Vouchers = ({ url }) => {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentVoucher, setCurrentVoucher] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, voucherId: null })

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`${url}/api/voucher/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setVouchers(response.data.data)
      } else {
        toast.error(response.data.message || "Lỗi khi tải danh sách voucher")
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
        const token = localStorage.getItem("token")
        const response = await axios.post(
          `${url}/api/voucher/delete`,
          { id: confirmModal.voucherId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-custom p-6 mb-8">
        <VoucherHeader onAddClick={handleAddVoucher} />

        {loading ? (
          <VoucherLoadingState />
        ) : vouchers.length > 0 ? (
          <VoucherTable
            vouchers={vouchers}
            onEditVoucher={handleEditVoucher}
            onDeleteClick={handleDeleteClick}
            formatDate={formatDate}
          />
        ) : (
          <VoucherEmptyState onAddClick={handleAddVoucher} />
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
