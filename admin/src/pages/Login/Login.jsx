"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { User, Shield } from "lucide-react"

// Import components
import LoginHeader from "../../components/login/LoginHeader"
import EmailInput from "../../components/login/EmailInput"
import PasswordInput from "../../components/login/PasswordInput"
import RememberMeCheckbox from "../../components/login/RememberMeCheckbox"
import LoginButton from "../../components/login/LoginButton"
import ForgotPasswordLink from "../../components/login/ForgotPasswordLink"
import ErrorMessage from "../../components/login/ErrorMessage"

const Login = ({ url, setToken }) => {
  const [data, setData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData((data) => ({ ...data, [name]: value }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const onLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    console.log("Login attempt with:", { email: data.email })

    try {
      const response = await axios.post(`${url}/api/user/admin-login`, data)
      console.log("Login response:", response.data)

      if (response.data.success) {
        const { token, user } = response.data
        console.log("Login successful, user role:", user.role)

        // Store token and user data
        if (rememberMe) {
          localStorage.setItem("token", token)
          localStorage.setItem("user", JSON.stringify(user))
        } else {
          sessionStorage.setItem("token", token)
          sessionStorage.setItem("user", JSON.stringify(user))
        }

        setToken(token)
        toast.success("Đăng nhập thành công!")

        // Redirect based on role
        setTimeout(() => {
          if (user.role === "admin") {
            console.log("Redirecting admin to /revenue")
            window.location.href = "/revenue"
          } else if (user.role === "staff") {
            console.log("Redirecting staff to /orders")
            window.location.href = "/orders"
          } else {
            console.log("Unknown role, redirecting to /orders")
            window.location.href = "/orders"
          }
        }, 1000)
      } else {
        console.error("Login failed:", response.data.message)
        setError(response.data.message || "Đăng nhập thất bại")
        toast.error(response.data.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error.response?.data?.message || "Lỗi kết nối đến máy chủ"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <LoginHeader />

          {error && <ErrorMessage message={error} />}

          <form onSubmit={onLogin} className="space-y-6">
            <EmailInput value={data.email} onChange={onChangeHandler} disabled={loading} />

            <PasswordInput
              value={data.password}
              onChange={onChangeHandler}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              disabled={loading}
            />

            <div className="flex items-center justify-between">
              <RememberMeCheckbox checked={rememberMe} onChange={setRememberMe} disabled={loading} />
              <ForgotPasswordLink />
            </div>

            <LoginButton loading={loading} />
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield size={16} />
              <span>Admin Panel - Secure Access</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Chỉ dành cho Admin và Staff</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <User size={14} className="text-blue-500" />
              <span>Admin: Toàn quyền</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield size={14} className="text-green-500" />
              <span>Staff: Hạn chế</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
