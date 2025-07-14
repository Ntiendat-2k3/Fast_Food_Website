"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { Lock } from "lucide-react"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"

const ResetPassword = () => {
  const { url } = useContext(StoreContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const tokenFromUrl = queryParams.get("token")
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setError("Liên kết đặt lại mật khẩu không hợp lệ hoặc bị thiếu.")
    }
  }, [location.search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (!token) {
      setError("Không có token đặt lại mật khẩu.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.")
      return
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${url}/api/user/reset-password`, {
        token,
        newPassword,
      })

      if (response.data.success) {
        setMessage(response.data.message + " Bạn sẽ được chuyển hướng đến trang đăng nhập.")
        setTimeout(() => {
          navigate("/login") // Assuming /login is your login page route
        }, 3000)
      } else {
        setError(response.data.message || "Đặt lại mật khẩu thất bại.")
      }
    } catch (err) {
      console.error("Reset password error:", err)
      setError(err.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-dark dark:text-white mb-6">Đặt lại mật khẩu</h2>

          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {!token ? (
            <p className="text-center text-gray-600 dark:text-gray-400">{error || "Đang tải..."}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-light text-dark py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
