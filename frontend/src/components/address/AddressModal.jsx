"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AddressAutocomplete from "./AddressAutocomplete"

const AddressModal = ({ isOpen, onClose, formMode, formData, formErrors, onChangeHandler, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(e)
  }

  const handleAddressChange = (address) => {
    onChangeHandler({
      target: {
        name: "street",
        value: address,
      },
    })
  }

  const handleAddressSelect = (addressData) => {
    onChangeHandler({
      target: {
        name: "street",
        value: addressData.description || addressData.mainText || addressData.address,
      },
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                {formMode === "add" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Họ và tên người nhận *</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={onChangeHandler}
                  placeholder="Nhập họ và tên"
                  className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                    formErrors.name ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Số điện thoại *</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={onChangeHandler}
                  placeholder="VD: 0912345678"
                  className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                    formErrors.phone ? "border-red-500" : "border-slate-600"
                  }`}
                />
                {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Địa chỉ chi tiết *</label>
                <AddressAutocomplete
                  value={formData.street}
                  onChange={handleAddressChange}
                  onSelect={handleAddressSelect}
                  placeholder="Nhập địa chỉ chi tiết..."
                  className="w-full"
                />
                {formErrors.street && <p className="text-red-400 text-sm mt-1">{formErrors.street}</p>}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg font-medium transition-colors"
                >
                  {formMode === "add" ? "Thêm địa chỉ" : "Cập nhật"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AddressModal
