"use client"

import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { X, Send, Bell, Users, User, Info, CheckCircle, AlertTriangle } from "lucide-react"

const NotificationModal = ({ isOpen, onClose, onSuccess, staff, url }) => {
  const [formData, setFormData] = useState({
    recipient: "all", // "all" or specific staff ID
    title: "",
    message: "",
    type: "info", // info, warning, success
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung")
      return
    }

    setLoading(true)

    try {
      if (formData.recipient === "all") {
        // Send to all active staff
        const promises = staff.map((staffMember) =>
          axios.post(`${url}/api/staff/send-notification`, {
            staffId: staffMember._id,
            title: formData.title,
            message: formData.message,
            type: formData.type,
          }),
        )

        const results = await Promise.allSettled(promises)
        const successful = results.filter((result) => result.status === "fulfilled").length
        const failed = results.length - successful

        if (successful > 0) {
          toast.success(
            `Đã gửi thông báo thành công đến ${successful} nhân viên${failed > 0 ? `, ${failed} thất bại` : ""}`,
          )
        } else {
          toast.error("Không thể gửi thông báo đến bất kỳ nhân viên nào")
        }
      } else {
        // Send to specific staff
        const response = await axios.post(`${url}/api/staff/send-notification`, {
          staffId: formData.recipient,
          title: formData.title,
          message: formData.message,
          type: formData.type,
        })

        if (response.data.success) {
          toast.success(response.data.message)
        } else {
          toast.error(response.data.message || "Lỗi khi gửi thông báo")
        }
      }

      // Reset form and close modal
      setFormData({
        recipient: "all",
        title: "",
        message: "",
        type: "info",
      })
      onSuccess()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const notificationTypes = [
    { value: "info", label: "Thông tin", icon: Info, color: "text-blue-500", bgColor: "bg-blue-50" },
    { value: "warning", label: "Cảnh báo", icon: AlertTriangle, color: "text-yellow-500", bgColor: "bg-yellow-50" },
    { value: "success", label: "Thành công", icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-50" },
  ]

  const selectedType = notificationTypes.find((type) => type.value === formData.type)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Bell size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gửi thông báo</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tạo và gửi thông báo đến nhân viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Người nhận</label>
            <div className="relative">
              <select
                value={formData.recipient}
                onChange={(e) => handleInputChange("recipient", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark dark:text-white appearance-none"
                disabled={loading}
              >
                <option value="all">Tất cả nhân viên ({staff.length} người)</option>
                {staff.map((staffMember) => (
                  <option key={staffMember._id} value={staffMember._id}>
                    {staffMember.name} ({staffMember.email})
                  </option>
                ))}
              </select>
              {formData.recipient === "all" ? (
                <Users size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              ) : (
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              )}
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại thông báo</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {notificationTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange("type", type.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.type === type.value
                        ? `border-current ${type.color} ${type.bgColor}`
                        : "border-gray-200 dark:border-dark-border hover:border-gray-300"
                    }`}
                    disabled={loading}
                  >
                    <Icon
                      size={20}
                      className={`mx-auto mb-1 ${formData.type === type.value ? type.color : "text-gray-400"}`}
                    />
                    <span
                      className={`text-xs font-medium ${formData.type === type.value ? type.color : "text-gray-600 dark:text-gray-400"}`}
                    >
                      {type.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiêu đề thông báo</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark dark:text-white"
              disabled={loading}
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">{formData.title.length}/100 ký tự</div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nội dung thông báo
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark dark:text-white resize-none"
              disabled={loading}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">{formData.message.length}/500 ký tự</div>
          </div>

          {/* Preview */}
          {formData.title && formData.message && (
            <div className="border border-gray-200 dark:border-dark-border rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Xem trước:</h4>
              <div className={`p-4 rounded-lg ${selectedType.bgColor} border-l-4 border-current ${selectedType.color}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <selectedType.icon size={16} className={selectedType.color} />
                  <h5 className={`font-medium ${selectedType.color}`}>{formData.title}</h5>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{formData.message}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.message.trim()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Gửi thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NotificationModal
