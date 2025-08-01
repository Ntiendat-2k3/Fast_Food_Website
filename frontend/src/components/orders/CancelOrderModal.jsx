"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, MessageSquare } from "lucide-react"

const CancelOrderModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const cancelReasons = [
    "Thay đổi ý định, không muốn mua nữa",
    "Tìm được sản phẩm tương tự với giá tốt hơn",
    "Thời gian giao hàng quá lâu",
    "Đặt nhầm sản phẩm/số lượng",
    "Có việc đột xuất, không thể nhận hàng",
    "Không còn nhu cầu sử dụng",
    "Lý do khác",
  ]

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason)
    if (reason === "Lý do khác") {
      setShowCustomInput(true)
    } else {
      setShowCustomInput(false)
      setCustomReason("")
    }
  }

  const handleConfirm = () => {
    const finalReason = selectedReason === "Lý do khác" ? customReason : selectedReason
    if (finalReason.trim()) {
      onConfirm(finalReason)
    }
  }

  const handleClose = () => {
    setSelectedReason("")
    setCustomReason("")
    setShowCustomInput(false)
    onClose()
  }

  const isConfirmDisabled = !selectedReason || (selectedReason === "Lý do khác" && !customReason.trim())

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-yellow-500/30 flex flex-col overflow-hidden"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 px-6 py-4 border-b border-red-500/30 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Hủy đơn hàng</h3>
                    <p className="text-sm text-slate-300">Vui lòng cho chúng tôi biết lý do</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content - Đã sửa để có thể scroll */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-3">
                {cancelReasons.map((reason, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedReason === reason
                        ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300"
                        : "bg-slate-700/50 border-slate-600/30 text-slate-300 hover:bg-slate-700/70 hover:border-slate-500/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => handleReasonSelect(reason)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedReason === reason
                          ? "border-yellow-400 bg-yellow-400"
                          : "border-slate-400 bg-transparent"
                      }`}
                    >
                      {selectedReason === reason && <div className="w-2 h-2 rounded-full bg-slate-800" />}
                    </div>
                    <span className="text-sm font-medium">{reason}</span>
                  </label>
                ))}
              </div>

              {/* Custom reason input */}
              <AnimatePresence>
                {showCustomInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Vui lòng nhập lý do cụ thể..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500/50 focus:bg-slate-700/70 transition-all duration-200 resize-none"
                        rows={3}
                        maxLength={200}
                        disabled={isLoading}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-slate-400">{customReason.length}/200</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-600/30 shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-600/50 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirmDisabled || isLoading}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang hủy...</span>
                    </>
                  ) : (
                    <span>Xác nhận hủy</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CancelOrderModal
