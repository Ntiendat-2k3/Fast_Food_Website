"use client"

import { useContext, useState, useEffect } from "react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { X, Mail, Lock, User } from "lucide-react"

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUser } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Login")
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: "312113444363-2urqmtu2ev7npltlgljj4vcnf8g623np.apps.googleusercontent.com",
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          // Render the button after initialization
          setTimeout(() => {
            renderGoogleButton()
          }, 100)
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error)
        }
      } else {
        // If Google script not loaded yet, try again after a delay
        setTimeout(initializeGoogleSignIn, 500)
      }
    }

    initializeGoogleSignIn()
  }, [currState])

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true)
      setError("")
      console.log("Google response received:", response)

      if (!response.credential) {
        throw new Error("No credential received from Google")
      }

      const result = await axios.post(`${url}/api/user/google-login`, {
        credential: response.credential,
      })

      console.log("Google login response:", result.data)

      if (result.data.success) {
        // Store token
        localStorage.setItem("token", result.data.token)
        setToken(result.data.token)

        // Store user data
        if (result.data.user) {
          console.log("Google user data received:", result.data.user)
          localStorage.setItem("user", JSON.stringify(result.data.user))
          setUser(result.data.user)
          setShowLogin(false)
          alert("Đăng nhập Google thành công!")
        }
      } else {
        setError(result.data.message || "Đăng nhập Google thất bại")
        alert(result.data.message || "Đăng nhập Google thất bại")
      }
    } catch (error) {
      console.error("Google login error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Đăng nhập Google thất bại"
      setError("Đăng nhập Google thất bại: " + errorMessage)
      alert("Đăng nhập Google thất bại: " + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderGoogleButton = () => {
    try {
      if (window.google && window.google.accounts) {
        const buttonContainer = document.getElementById("google-signin-button")
        if (buttonContainer) {
          // Clear previous button
          buttonContainer.innerHTML = ""

          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: currState === "Login" ? "signin_with" : "signup_with",
            shape: "rectangular",
            logo_alignment: "left",
          })
        }
      }
    } catch (error) {
      console.error("Error rendering Google button:", error)
    }
  }

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData((data) => ({ ...data, [name]: value }))
  }

  const login = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Attempting login with:", data.email)

      const response = await axios.post(`${url}/api/user/login`, {
        email: data.email,
        password: data.password,
      })

      console.log("Login response:", response.data)

      if (response.data.success) {
        // Store token
        localStorage.setItem("token", response.data.token)
        setToken(response.data.token)

        // Check if user data is in the response
        if (response.data.user) {
          console.log("User data received:", response.data.user)
          localStorage.setItem("user", JSON.stringify(response.data.user))
          setUser(response.data.user)
          setShowLogin(false)
          alert("Đăng nhập thành công")
        } else {
          console.log("No user data in response, fetching from profile endpoint")

          // Fetch user data from profile endpoint
          try {
            const userResponse = await axios.get(`${url}/api/user/profile`, {
              headers: { token: response.data.token },
            })

            console.log("Profile response:", userResponse.data)

            if (userResponse.data.success && userResponse.data.data) {
              localStorage.setItem("user", JSON.stringify(userResponse.data.data))
              setUser(userResponse.data.data)
              setShowLogin(false)
              alert("Đăng nhập thành công")
            } else {
              setError("Không thể lấy thông tin người dùng")
              alert("Đăng nhập thành công nhưng không thể lấy thông tin người dùng")
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError)
            setError("Lỗi khi lấy thông tin người dùng")
            alert("Đăng nhập thành công nhưng không thể lấy thông tin người dùng")
          }
        }
      } else {
        setError(response.data.message || "Đăng nhập thất bại")
        alert(response.data.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Đăng nhập thất bại: " + (error.response?.data?.message || error.message))
      alert("Đăng nhập thất bại: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const register = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Attempting registration with:", data)

      const response = await axios.post(`${url}/api/user/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
      })

      console.log("Registration response:", response.data)

      if (response.data.success) {
        // Store token
        localStorage.setItem("token", response.data.token)
        setToken(response.data.token)

        // Check if user data is in the response
        if (response.data.user) {
          console.log("User data received:", response.data.user)
          localStorage.setItem("user", JSON.stringify(response.data.user))
          setUser(response.data.user)
          setShowLogin(false)
          alert("Đăng ký thành công")
        } else {
          console.log("No user data in response, fetching from profile endpoint")

          // Fetch user data from profile endpoint
          try {
            const userResponse = await axios.get(`${url}/api/user/profile`, {
              headers: { token: response.data.token },
            })

            console.log("Profile response:", userResponse.data)

            if (userResponse.data.success && userResponse.data.data) {
              localStorage.setItem("user", JSON.stringify(userResponse.data.data))
              setUser(userResponse.data.data)
              setShowLogin(false)
              alert("Đăng ký thành công")
            } else {
              setError("Không thể lấy thông tin người dùng")
              alert("Đăng ký thành công nhưng không thể lấy thông tin người dùng")
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError)
            setError("Lỗi khi lấy thông tin người dùng")
            alert("Đăng ký thành công nhưng không thể lấy thông tin người dùng")
          }
        }
      } else {
        setError(response.data.message || "Đăng ký thất bại")
        alert(response.data.message || "Đăng ký thất bại")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Đăng ký thất bại: " + (error.response?.data?.message || error.message))
      alert("Đăng ký thất bại: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (currState === "Login") {
      await login()
    } else {
      await register()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              {currState === "Login" ? "Đăng nhập" : "Đăng ký"}
            </h2>
            <button
              onClick={() => setShowLogin(false)}
              className="text-gray-400 hover:text-dark dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <div id="google-signin-button" className="w-full flex justify-center min-h-[40px]"></div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400">
                Hoặc tiếp tục với email
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {currState === "Sign Up" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                  type="text"
                  placeholder="Tên của bạn"
                  required
                  className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="email"
                onChange={onChangeHandler}
                value={data.email}
                type="email"
                placeholder="Email của bạn"
                required
                className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="password"
                onChange={onChangeHandler}
                value={data.password}
                type="password"
                placeholder="Mật khẩu"
                required
                className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-dark py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : currState === "Sign Up" ? "Tạo tài khoản" : "Đăng nhập"}
            </button>

            {currState === "Sign Up" ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 bg-white dark:bg-dark-light border-gray-300 dark:border-dark-lighter rounded focus:ring-primary"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Bằng cách tiếp tục, tôi đồng ý với điều khoản và chính sách bảo mật
                </label>
              </div>
            ) : null}

            {currState === "Login" ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Tạo tài khoản mới?{" "}
                <button
                  type="button"
                  onClick={() => setCurrState("Sign Up")}
                  className="text-primary hover:underline focus:outline-none"
                >
                  Nhấn vào đây
                </button>
              </p>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Bạn đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setCurrState("Login")}
                  className="text-primary hover:underline focus:outline-none"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPopup
