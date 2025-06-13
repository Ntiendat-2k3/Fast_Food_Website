"use client"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import AddressForm from "./AddressForm"

const AddressModal = ({ isOpen, onClose, formMode, formData, formErrors, onChangeHandler, onSubmit }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 w-full max-w-md overflow-hidden"
      >
        <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {formMode === "add" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          <AddressForm
            data={formData}
            errors={formErrors}
            onChangeHandler={onChangeHandler}
            onSubmit={onSubmit}
            mode={formMode}
            onCancel={onClose}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default AddressModal
