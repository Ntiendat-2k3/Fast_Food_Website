"use client"

import { useState, useContext } from "react"
import { X, Lock } from "lucide-react"
import axios from "axios"
import { StoreContext } from "../context/StoreContext"

const ChangePasswordModal = ({ onClose }) => {
  const { url, token } = useContext(StoreContext)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.")
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(
        `${url}/api/user/change-password`,
        {
          currentPassword,
          newPassword,
          confirmNewPassword,
        },
        { headers: { token } },
      )

      if (response.data.success) {
        setMessage(response.data.message)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        setTimeout(() => {
          onClose() // Close modal after success
        }, 2000)
      } else {
        setError(response.data.message || "Thay đổi mật khẩu thất bại.")
      }
    } catch (err) {
      console.error("Change password error:", err)
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi thay đổi mật khẩu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark dark:text-white">Đổi mật khẩu</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-dark py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal
