"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { Eye, EyeOff, LogIn } from "lucide-react"

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
          <div className="text-center mb-8">
            <img className="mx-auto h-16 w-auto" src="/logo.png" alt="Logo" />
            <h2 className="mt-4 text-3xl font-extrabold text-white">Đăng nhập vào trang quản trị</h2>
            <p className="mt-2 text-sm text-gray-400">Vui lòng đăng nhập để truy cập vào hệ thống quản lý</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập email của bạn"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Mật khẩu
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nhập mật khẩu của bạn"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-light">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="mr-2" size={20} />
                    Đăng nhập
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
