"use client"

import { useState, useEffect } from "react"
import { X, User, Mail, Phone, MapPin, Briefcase, Eye, EyeOff, Upload, Camera, Bell, Send } from 'lucide-react'
import axios from "axios"
import { toast } from "react-toastify"

const StaffModal = ({ isOpen, onClose, onSuccess, mode, staff, url }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    position: "Nhân viên",
    isActive: true,
    avatar: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    type: "info"
  })
  const [sendingNotification, setSendingNotification] = useState(false)

  useEffect(() => {
    if (staff && (mode === "edit" || mode === "view")) {
      setFormData({
        name: staff.name || "",
        email: staff.email || "",
        password: "",
        phone: staff.phone || "",
        address: staff.address || "",
        position: staff.position || "Nhân viên",
        isActive: staff.isActive !== undefined ? staff.isActive : true,
        avatar: staff.avatar || "",
      })
      setAvatarPreview(staff.avatar ? `${url}/images/${staff.avatar}` : "")
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        position: "Nhân viên",
        isActive: true,
        avatar: "",
      })
      setAvatarPreview("")
    }
    setAvatarFile(null)
    setShowNotificationForm(false)
    setNotification({ title: "", message: "", type: "info" })
  }, [staff, mode, url])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB")
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file ảnh")
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!validateEmail(formData.email)) {
      toast.error("Email không đúng định dạng")
      setLoading(false)
      return
    }

    if (mode === "add" && formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      setLoading(false)
      return
    }

    try {
      const submitData = new FormData()

      // Add form data
      Object.keys(formData).forEach(key => {
        if (key !== 'avatar') {
          submitData.append(key, formData[key])
        }
      })

      // Add avatar file if selected
      if (avatarFile) {
        submitData.append('avatar', avatarFile)
      }

      let response
      if (mode === "add") {
        response = await axios.post(`${url}/api/staff/add`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else if (mode === "edit") {
        response = await axios.put(`${url}/api/staff/update/${staff._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      if (response.data.success) {
        toast.success(response.data.message)
        onSuccess()
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Lỗi kết nối đến máy chủ")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notification.title.trim() || !notification.message.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung thông báo")
      return
    }

    setSendingNotification(true)
    try {
      const response = await axios.post(`${url}/api/staff/send-notification`, {
        staffId: staff._id,
        title: notification.title,
        message: notification.message,
        type: notification.type
      })

      if (response.data.success) {
        toast.success("Gửi thông báo thành công!")
        setShowNotificationForm(false)
        setNotification({ title: "", message: "", type: "info" })
      } else {
        toast.error(response.data.message || "Lỗi khi gửi thông báo")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Lỗi kết nối đến máy chủ")
    } finally {
      setSendingNotification(false)
    }
  }

  if (!isOpen) return null

  const isViewMode = mode === "view"
  const isEditMode = mode === "edit"
  const isAddMode = mode === "add"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <div className="flex items-center space-x-2">
            {/* Send Notification Button - Only show for existing staff */}
            {(isViewMode || isEditMode) && staff && (
              <button
                onClick={() => setShowNotificationForm(!showNotificationForm)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Gửi thông báo"
              >
                <Bell size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-lighter rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Notification Form */}
          {showNotificationForm && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                <Bell size={20} className="mr-2" />
                Gửi thông báo cho nhân viên
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loại thông báo
                  </label>
                  <select
                    value={notification.type}
                    onChange={(e) => setNotification(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark dark:text-white"
                  >
                    <option value="info">Thông tin</option>
                    <option value="warning">Cảnh báo</option>
                    <option value="success">Thành công</option>
                    {/* <option value="error">Lỗi</option> */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={notification.title}
                    onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark dark:text-white"
                    placeholder="Nhập tiêu đề thông báo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung *
                  </label>
                  <textarea
                    value={notification.message}
                    onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark dark:text-white resize-none"
                    placeholder="Nhập nội dung thông báo"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNotificationForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-lighter hover:bg-gray-200 dark:hover:bg-dark-border rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSendNotification}
                    disabled={sendingNotification}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>{sendingNotification ? "Đang gửi..." : "Gửi thông báo"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ảnh đại diện
                </label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-lighter border-4 border-white dark:border-dark-border shadow-lg">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview || "/placeholder.svg"}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-golden">
                          <User size={48} className="text-white" />
                        </div>
                      )}
                    </div>
                    {!isViewMode && (
                      <label className="absolute bottom-0 right-0 p-2 bg-gradient-golden rounded-full cursor-pointer hover:shadow-lg transition-all">
                        <Camera size={16} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {!isViewMode && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Chọn ảnh JPG, PNG (tối đa 5MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Họ và tên *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
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
                        placeholder="Nhập email (ví dụ: user@example.com)"
                      />
                    </div>
                  </div>
                </div>

                {/* Password (only for add mode) */}
                {isAddMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mật khẩu *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Số điện thoại
                    </label>
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

                  {/* Position - Fixed as "Nhân viên" */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vị trí công việc
                    </label>
                    <div className="relative">
                      <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="position"
                        value="Nhân viên"
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-gray-100 dark:bg-dark-lighter text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa chỉ
                  </label>
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
              </div>
            </div>

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
    </div>
  )
}

export default StaffModal
