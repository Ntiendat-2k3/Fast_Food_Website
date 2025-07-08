"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"
import PasswordInput from "../../components/login/PasswordInput"
import RememberMeCheckbox from "../../components/login/RememberMeCheckbox"
import ForgotPasswordLink from "../../components/login/ForgotPasswordLink"
import LoginButton from "../../components/login/LoginButton"
import ErrorMessage from "../../components/login/ErrorMessage"
import LoginHeader from "../../components/login/LoginHeader"
import EmailInput from "../../components/login/EmailInput"

const Login = ({ url, onLogin, isAuthenticated }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}")
      navigate(userData.role === "admin" ? "/revenue" : "/orders")
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu")
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting login with:", { email, url })

      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password,
      })

      console.log("Login response:", response.data)

      if (response.data.success) {
        const userData = response.data.user

        // Check if user has admin or staff role
        if (userData.role !== "admin" && userData.role !== "staff") {
          setError("Bạn không có quyền truy cập vào trang quản trị")
          setIsLoading(false)
          return
        }

        // Save to localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberLogin", "true")
        }

        onLogin(response.data.token, userData)
        toast.success("Đăng nhập thành công!")

        // Redirect based on role
        navigate(userData.role === "admin" ? "/revenue" : "/orders")
      } else {
        setError(response.data.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error.response) {
        setError(error.response.data.message || "Lỗi từ server")
      } else if (error.request) {
        setError("Không thể kết nối đến server")
      } else {
        setError("Đã xảy ra lỗi khi đăng nhập")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <LoginHeader />

          <form onSubmit={handleSubmit} className="space-y-6">
            <EmailInput email={email} setEmail={setEmail} disabled={isLoading} />

            <PasswordInput password={password} setPassword={setPassword} disabled={isLoading} />

            <div className="flex items-center justify-between">
              <RememberMeCheckbox rememberMe={rememberMe} setRememberMe={setRememberMe} disabled={isLoading} />
              <ForgotPasswordLink />
            </div>

            {error && <ErrorMessage message={error} />}

            <LoginButton isLoading={isLoading} />
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
