"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, MapPin, Briefcase, Eye, EyeOff } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const StaffModal = ({ isOpen, onClose, onSuccess, mode, staff, url }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    position: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (staff && (mode === "edit" || mode === "view")) {
      setFormData({
        name: staff.name || "",
        email: staff.email || "",
        password: "",
        phone: staff.phone || "",
        address: staff.address || "",
        position: staff.position || "",
        isActive: staff.isActive !== undefined ? staff.isActive : true,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        position: "Nhân viên",
        isActive: true,
      })
    }
  }, [staff, mode])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let response
      if (mode === "add") {
        response = await axios.post(`${url}/api/staff/add`, formData)
      } else if (mode === "edit") {
        response = await axios.put(`${url}/api/staff/update/${staff._id}`, formData)
      }

      if (response.data.success) {
        toast.success(response.data.message)
        onSuccess()
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isViewMode = mode === "view"
  const isEditMode = mode === "edit"
  const isAddMode = mode === "add"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-golden rounded-lg">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {isAddMode && "Thêm nhân viên mới"}
                {isEditMode && "Chỉnh sửa nhân viên"}
                {isViewMode && "Thông tin nhân viên"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isAddMode && "Điền thông tin để thêm nhân viên mới"}
                {isEditMode && "Cập nhật thông tin nhân viên"}
                {isViewMode && "Xem chi tiết thông tin nhân viên"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-lighter rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Họ và tên *</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white disabled:bg-gray-100 dark:disabled:bg-dark-lighter"
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white disabled:bg-gray-100 dark:disabled:bg-dark-lighter"
                  placeholder="Nhập email"
                />
              </div>
            </div>
          </div>

          {/* Password (only for add mode) */}
          {isAddMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white"
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white disabled:bg-gray-100 dark:disabled:bg-dark-lighter"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vị trí công việc
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white disabled:bg-gray-100 dark:disabled:bg-dark-lighter"
                  placeholder="Nhập vị trí công việc"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa chỉ</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={isViewMode}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-transparent dark:bg-dark dark:text-white disabled:bg-gray-100 dark:disabled:bg-dark-lighter resize-none"
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          {/* Status */}
          {!isAddMode && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="w-4 h-4 text-golden-500 bg-gray-100 border-gray-300 rounded focus:ring-golden-500 dark:focus:ring-golden-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tài khoản đang hoạt động
              </label>
            </div>
          )}

          {/* View Mode Info */}
          {isViewMode && staff && (
            <div className="bg-gray-50 dark:bg-dark-lighter rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ngày tạo:</span>
                <span className="text-gray-800 dark:text-white">
                  {new Date(staff.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    staff.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {staff.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isViewMode && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-lighter hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-golden text-white rounded-lg hover:shadow-golden/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : isAddMode ? "Thêm nhân viên" : "Cập nhật"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default StaffModal
