"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

// Import components
import LoginHeader from "../../components/login/LoginHeader"
import EmailInput from "../../components/login/EmailInput"
import PasswordInput from "../../components/login/PasswordInput"
import RememberMeCheckbox from "../../components/login/RememberMeCheckbox"
import ForgotPasswordLink from "../../components/login/ForgotPasswordLink"
import LoginButton from "../../components/login/LoginButton"
import ErrorMessage from "../../components/login/ErrorMessage"

const Login = ({ url, onLogin, isAuthenticated }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/revenue"

  // If already authenticated, redirect to the intended page
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password,
      })

      if (response.data.success) {
        // Check if user has admin role
        if (response.data.user && response.data.user.role === "admin") {
          toast.success("Đăng nhập thành công!")
          // Call the onLogin function with the token
          onLogin(response.data.token)
          // Redirect to the page they tried to visit or revenue page
          navigate(from, { replace: true })
        } else {
          setError("Bạn không có quyền truy cập vào trang quản trị.")
          toast.error("Bạn không có quyền truy cập vào trang quản trị.")
        }
      } else {
        setError(response.data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
        toast.error(response.data.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.")
      toast.error("Đã xảy ra lỗi khi đăng nhập")
    } finally {
      setLoading(false)
    }
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="px-6 py-8">
          <LoginHeader />

          <ErrorMessage message={error} />

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} />

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                toggleVisibility={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className="flex items-center justify-between">
              <RememberMeCheckbox />
              <ForgotPasswordLink />
            </div>

            <div>
              <LoginButton loading={loading} />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
