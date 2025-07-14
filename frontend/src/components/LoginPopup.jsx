"use client"

import { useContext, useState, useEffect } from "react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { X, Mail, Lock, User, KeyRound } from "lucide-react"

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUser } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Login") // "Login", "Sign Up", "Verify Email", "ForgotPasswordEmail", "ForgotPasswordCode"
  const [data, setData] = useState({
    name: "", // Used for login and signup username
    email: "", // Used for signup email, verification, and forgot password
    password: "",
    newPassword: "", // For password reset flow
    confirmNewPassword: "", // For password reset flow
  })
  const [verificationCode, setVerificationCode] = useState("") // For email verification and password reset code
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [isCodeEnteredForReset, setIsCodeEnteredForReset] = useState(false) // New state for password reset code step

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

          setTimeout(() => {
            renderGoogleButton()
          }, 100)
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error)
        }
      } else {
        setTimeout(initializeGoogleSignIn, 500)
      }
    }

    if (currState === "Login" || currState === "Sign Up") {
      initializeGoogleSignIn()
    }
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
        localStorage.setItem("token", result.data.token)
        setToken(result.data.token)

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
      console.log("Attempting login with:", data.name) // Use data.name for login

      const response = await axios.post(`${url}/api/user/login`, {
        name: data.name, // Send name
        password: data.password,
      })

      console.log("Login response:", response.data)

      if (response.data.success) {
        localStorage.setItem("token", response.data.token)
        setToken(response.data.token)

        if (response.data.user) {
          console.log("User data received:", response.data.user)
          localStorage.setItem("user", JSON.stringify(response.data.user))
          setUser(response.data.user)
          setShowLogin(false)
          alert("Đăng nhập thành công")
        } else {
          console.log("No user data in response, fetching from profile endpoint")

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
        if (response.data.message.includes("Tài khoản chưa được xác minh")) {
          setCurrState("Verify Email")
          // Pre-fill email for verification
          setData((prev) => ({ ...prev, email: data.email || "" }))
          setResendTimer(60)
        }
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
        if (response.data.verificationRequired) {
          setCurrState("Verify Email")
          setResendTimer(60)
          alert(response.data.message)
        } else {
          localStorage.setItem("token", response.data.token)
          setToken(response.data.token)
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user))
            setUser(response.data.user)
          }
          setShowLogin(false)
          alert("Đăng ký thành công")
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

  const handleVerifyEmail = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Attempting email verification for:", data.email, "with code:", verificationCode)

      const response = await axios.post(`${url}/api/user/verify-email`, {
        email: data.email,
        code: verificationCode,
      })

      console.log("Verification response:", response.data)

      if (response.data.success) {
        alert(response.data.message)
        setCurrState("Login")
        setVerificationCode("")
      } else {
        setError(response.data.message || "Xác minh email thất bại")
        alert(response.data.message || "Xác minh email thất bại")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Xác minh email thất bại: " + (error.response?.data?.message || error.message))
      alert("Xác minh email thất bại: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Attempting to resend verification code to:", data.email)

      // Re-call the register endpoint, it's designed to resend if user exists but not verified
      const response = await axios.post(`${url}/api/user/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
      })

      if (response.data.success && response.data.verificationRequired) {
        alert("Mã xác minh mới đã được gửi đến email của bạn.")
        setResendTimer(60)
      } else {
        setError(response.data.message || "Không thể gửi lại mã xác minh.")
        alert(response.data.message || "Không thể gửi lại mã xác minh.")
      }
    } catch (error) {
      console.error("Resend code error:", error)
      setError("Lỗi khi gửi lại mã xác minh: " + (error.response?.data?.message || error.message))
      alert("Lỗi khi gửi lại mã xác minh: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordEmail = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Attempting forgot password for email:", data.email)

      const response = await axios.post(`${url}/api/user/forgot-password`, {
        email: data.email,
      })

      console.log("Forgot password email response:", response.data)

      if (response.data.success) {
        alert(response.data.message)
        setCurrState("ForgotPasswordCode") // Transition to code input state
        setResendTimer(60) // Start timer for resend code
        setIsCodeEnteredForReset(false) // Reset this state for the new flow
      } else {
        setError(response.data.message || "Yêu cầu đặt lại mật khẩu thất bại")
        alert(response.data.message || "Yêu cầu đặt lại mật khẩu thất bại")
      }
    } catch (error) {
      console.error("Forgot password email error:", error)
      setError("Yêu cầu đặt lại mật khẩu thất bại: " + (error.response?.data?.message || error.message))
      alert("Yêu cầu đặt lại mật khẩu thất bại: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // This function now handles the *final* password reset after code is "confirmed"
  const handleResetPasswordWithCode = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Attempting to reset password with code for:", data.email, "code:", verificationCode)

      if (data.newPassword !== data.confirmNewPassword) {
        setError("Mật khẩu mới và xác nhận mật khẩu không khớp.")
        setLoading(false)
        return
      }
      if (data.newPassword.length < 8) {
        setError("Mật khẩu mới phải có ít nhất 8 ký tự.")
        setLoading(false)
        return
      }

      const response = await axios.post(`${url}/api/user/reset-password`, {
        email: data.email,
        code: verificationCode,
        newPassword: data.newPassword,
      })

      console.log("Reset password with code response:", response.data)

      if (response.data.success) {
        alert(response.data.message)
        setCurrState("Login") // Go back to login after successful reset
        setVerificationCode("")
        setData({ name: "", email: "", password: "", newPassword: "", confirmNewPassword: "" }) // Clear all data
        setIsCodeEnteredForReset(false) // Reset state
      } else {
        setError(response.data.message || "Đặt lại mật khẩu thất bại.")
        alert(response.data.message || "Đặt lại mật khẩu thất bại.")
      }
    } catch (error) {
      console.error("Reset password with code error:", error)
      setError("Đặt lại mật khẩu thất bại: " + (error.response?.data?.message || error.message))
      alert("Đặt lại mật khẩu thất bại: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleResendResetCode = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Attempting to resend password reset code to:", data.email)

      const response = await axios.post(`${url}/api/user/forgot-password`, {
        email: data.email,
      })

      if (response.data.success) {
        alert("Mã đặt lại mật khẩu mới đã được gửi đến email của bạn.")
        setResendTimer(60) // Reset timer
        setIsCodeEnteredForReset(false) // Reset this state
      } else {
        setError(response.data.message || "Không thể gửi lại mã đặt lại mật khẩu.")
        alert(response.data.message || "Không thể gửi lại mã đặt lại mật khẩu.")
      }
    } catch (error) {
      console.error("Resend reset code error:", error)
      setError("Lỗi khi gửi lại mã đặt lại mật khẩu: " + (error.response?.data?.message || error.message))
      alert("Lỗi khi gửi lại mã đặt lại mật khẩu: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // New function to handle confirming the reset code on the frontend
  const handleConfirmResetCode = () => {
    if (verificationCode.trim() === "") {
      setError("Vui lòng nhập mã xác minh.")
      return
    }
    setError("") // Clear any previous error
    setIsCodeEnteredForReset(true) // Allow password fields to show
  }

  useEffect(() => {
    let timer
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendTimer])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (currState === "Login") {
      await login()
    } else if (currState === "Sign Up") {
      await register()
    } else if (currState === "Verify Email") {
      await handleVerifyEmail()
    } else if (currState === "ForgotPasswordEmail") {
      await handleForgotPasswordEmail()
    } else if (currState === "ForgotPasswordCode") {
      if (!isCodeEnteredForReset) {
        handleConfirmResetCode() // First, confirm the code
      } else {
        await handleResetPasswordWithCode() // Then, reset the password
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              {currState === "Login"
                ? "Đăng nhập"
                : currState === "Sign Up"
                  ? "Đăng ký"
                  : currState === "Verify Email"
                    ? "Xác minh Email"
                    : currState === "ForgotPasswordEmail"
                      ? "Quên mật khẩu"
                      : currState === "ForgotPasswordCode"
                        ? isCodeEnteredForReset
                          ? "Đặt lại mật khẩu"
                          : "Xác minh mã"
                        : "Đặt lại mật khẩu"}
            </h2>
            <button
              onClick={() => setShowLogin(false)}
              className="text-gray-400 hover:text-dark dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {(currState === "Login" || currState === "Sign Up") && (
            <>
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
            </>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name input for Login and Sign Up */}
            {(currState === "Login" || currState === "Sign Up") && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                  type="text"
                  placeholder="Tên đăng nhập của bạn"
                  required
                  className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* Email input for Sign Up, Verify Email, and Forgot Password Email */}
            {(currState === "Sign Up" ||
              currState === "Verify Email" ||
              currState === "ForgotPasswordEmail" ||
              currState === "ForgotPasswordCode") && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="email"
                  onChange={onChangeHandler}
                  value={data.email}
                  type="email"
                  placeholder="Email của bạn"
                  required
                  disabled={currState === "Verify Email" || currState === "ForgotPasswordCode"} // Disable email input during verification/code input
                  className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>
            )}

            {/* Password input for Login and Sign Up */}
            {(currState === "Login" || currState === "Sign Up") && (
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
            )}

            {/* Verification Code input for Verify Email and Forgot Password Code states */}
            {(currState === "Verify Email" || currState === "ForgotPasswordCode") && (
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="verificationCode"
                  onChange={(e) => setVerificationCode(e.target.value)}
                  value={verificationCode}
                  type="text"
                  placeholder="Mã xác minh"
                  required
                  disabled={isCodeEnteredForReset && currState === "ForgotPasswordCode"} // Disable code input after it's "entered" for forgot password
                  className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>
            )}

            {/* New Password inputs for Forgot Password Code state, only if code is entered */}
            {currState === "ForgotPasswordCode" && isCodeEnteredForReset && (
              <>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="newPassword"
                    onChange={onChangeHandler}
                    value={data.newPassword}
                    type="password"
                    placeholder="Mật khẩu mới"
                    required
                    className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    name="confirmNewPassword"
                    onChange={onChangeHandler}
                    value={data.confirmNewPassword}
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    required
                    className="w-full bg-white dark:bg-dark-light text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-dark py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading
                ? "Đang xử lý..."
                : currState === "Sign Up"
                  ? "Tạo tài khoản"
                  : currState === "Verify Email"
                    ? "Xác minh"
                    : currState === "ForgotPasswordEmail"
                      ? "Gửi mã xác nhận"
                      : currState === "ForgotPasswordCode"
                        ? isCodeEnteredForReset
                          ? "Đặt lại mật khẩu"
                          : "Xác nhận mã"
                        : "Đặt lại mật khẩu"}
            </button>

            {(currState === "Verify Email" || (currState === "ForgotPasswordCode" && !isCodeEnteredForReset)) && (
              <button
                type="button"
                onClick={currState === "Verify Email" ? handleResendCode : handleResendResetCode}
                disabled={loading || resendTimer > 0}
                className="w-full text-primary hover:underline mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Gửi lại mã sau ${resendTimer}s` : "Gửi lại mã"}
              </button>
            )}

            {currState === "Sign Up" && (
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
            )}

            {currState === "Login" ? (
              <>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                  Tạo tài khoản mới?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrState("Sign Up")
                      setError("")
                      setData({ name: "", email: "", password: "", newPassword: "", confirmNewPassword: "" }) // Clear data
                      setIsCodeEnteredForReset(false) // Reset state
                    }}
                    className="text-primary hover:underline focus:outline-none"
                  >
                    Nhấn vào đây
                  </button>
                </p>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrState("ForgotPasswordEmail")
                      setError("")
                      setData({ name: "", email: "", password: "", newPassword: "", confirmNewPassword: "" }) // Clear data
                      setIsCodeEnteredForReset(false) // Reset state
                    }}
                    className="text-primary hover:underline focus:outline-none"
                  >
                    Quên mật khẩu?
                  </button>
                </p>
              </>
            ) : currState === "Sign Up" ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Bạn đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCurrState("Login")
                    setError("")
                    setData({ name: "", email: "", password: "", newPassword: "", confirmNewPassword: "" }) // Clear data
                    setIsCodeEnteredForReset(false) // Reset state
                  }}
                  className="text-primary hover:underline focus:outline-none"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Quay lại{" "}
                <button
                  type="button"
                  onClick={() => {
                    setCurrState("Login")
                    setError("")
                    setData({ name: "", email: "", password: "", newPassword: "", confirmNewPassword: "" }) // Clear data
                    setIsCodeEnteredForReset(false) // Reset state
                  }}
                  className="text-primary hover:underline focus:outline-none"
                >
                  Đăng nhập
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
