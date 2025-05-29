"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ArrowLeft, Copy, CheckCircle, Landmark, Clock } from "lucide-react"
import axios from "axios"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import { motion } from "framer-motion"

const Payment = () => {
  const { method, orderId } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 phút
  const [isProcessing, setIsProcessing] = useState(false)
  const { url } = useContext(StoreContext)

  // Thông tin tài khoản ngân hàng
  const bankInfo = {
    name: "GreenEats Shop",
    number: "1234567890",
    bank: "Vietcombank",
    branch: "Hà Nội",
    content: `GreenEats ${orderId?.slice(-6) || ""}`,
  }

  // Thông tin ví điện tử
  const walletInfo = {
    phone: "0912345678",
    name: "GreenEats Shop",
    content: `GreenEats ${orderId?.slice(-6) || ""}`,
  }

  useEffect(() => {
    console.log("Payment page loaded with params:", { method, orderId })
  }, [method, orderId])

  useEffect(() => {
    // Đếm ngược thời gian
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format thời gian đếm ngược
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Xử lý sao chép thông tin
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Đã sao chép vào clipboard")
  }

  // Xử lý hoàn thành thanh toán
  const handleCompletePayment = async () => {
    setIsProcessing(true)
    console.log("Completing payment for order:", orderId)

    try {
      // Gọi API để cập nhật trạng thái thanh toán
      const response = await axios.post(`${url}/api/order/verify`, {
        orderId: orderId,
        success: "true",
        paymentMethod: method,
      })

      console.log("Payment verification response:", response.data)

      if (response.data.success) {
        toast.success("Thanh toán thành công!")
        setTimeout(() => {
          navigate("/thankyou")
        }, 2000)
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi xác nhận thanh toán")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error)
      toast.error("Có lỗi xảy ra khi xác nhận thanh toán")
      setIsProcessing(false)
    }
  }

  // Xử lý hủy thanh toán
  const handleCancelPayment = async () => {
    try {
      // Gọi API để cập nhật trạng thái thanh toán thành thất bại
      await axios.post(`${url}/api/order/verify`, {
        orderId: orderId,
        success: "false",
        paymentMethod: method,
      })

      navigate("/cart")
    } catch (error) {
      console.error("Lỗi khi hủy thanh toán:", error)
      navigate("/cart")
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-slate-800 py-20 px-4">
      <div className="relative max-w-3xl mx-auto">
        {/* Animated orbs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full filter blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <motion.div variants={itemVariants} className="flex items-center mb-6">
              <button
                onClick={handleCancelPayment}
                className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-gray-300 transition-colors mr-4"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-white">Thanh toán đơn hàng</h1>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-700/30 border-l-4 border-primary p-4 mb-6 rounded-r-md flex items-center"
            >
              <Clock size={20} className="text-primary mr-3 flex-shrink-0" />
              <p className="text-gray-300">
                Vui lòng hoàn tất thanh toán trong{" "}
                <span className="font-bold text-primary">{formatTime(countdown)}</span>. Đơn hàng của bạn sẽ được xác
                nhận sau khi thanh toán thành công.
              </p>
            </motion.div>

            {method === "VNPay" && (
              <motion.div variants={itemVariants} className="text-center py-6">
                <div className="bg-slate-700/30 backdrop-blur-md p-6 rounded-xl shadow-lg inline-block mb-6 border border-slate-600/50">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png"
                      alt="VNPay QR Code"
                      className="w-64 h-64 object-contain mx-auto"
                    />
                  </div>
                </div>
                <p className="text-gray-300 mb-6">Quét mã QR bằng ứng dụng ngân hàng hoặc ví VNPay để thanh toán</p>
              </motion.div>
            )}

            {method === "MoMo" && (
              <motion.div variants={itemVariants} className="text-center py-6">
                <div className="bg-slate-700/30 backdrop-blur-md p-6 rounded-xl shadow-lg inline-block mb-6 border border-slate-600/50">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src="https://developers.momo.vn/v3/vi/assets/images/logo-momo-300-8126a80b5591add9f25a8b9f26c7ecf4.jpg"
                      alt="MoMo QR Code"
                      className="w-64 h-64 object-contain mx-auto"
                    />
                  </div>
                </div>
                <motion.div
                  variants={itemVariants}
                  className="bg-slate-700/30 backdrop-blur-md p-5 rounded-xl mb-6 max-w-md mx-auto border border-slate-600/50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400">Số điện thoại:</span>
                    <div className="flex items-center">
                      <span className="text-white font-medium mr-2">{walletInfo.phone}</span>
                      <button
                        onClick={() => handleCopy(walletInfo.phone)}
                        className="p-1.5 bg-slate-600/50 hover:bg-slate-600 rounded text-gray-300 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400">Người nhận:</span>
                    <span className="text-white font-medium">{walletInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Nội dung chuyển khoản:</span>
                    <div className="flex items-center">
                      <span className="text-white font-medium mr-2">{walletInfo.content}</span>
                      <button
                        onClick={() => handleCopy(walletInfo.content)}
                        className="p-1.5 bg-slate-600/50 hover:bg-slate-600 rounded text-gray-300 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
                <p className="text-gray-300 mb-6">
                  Quét mã QR bằng ứng dụng MoMo hoặc chuyển khoản theo thông tin trên
                </p>
              </motion.div>
            )}

            {method === "BankTransfer" && (
              <motion.div variants={itemVariants} className="py-6">
                <motion.div
                  variants={itemVariants}
                  className="bg-slate-700/30 backdrop-blur-md p-6 rounded-xl mb-6 border border-slate-600/50"
                >
                  <div className="flex items-center mb-5">
                    <Landmark size={24} className="text-primary mr-3" />
                    <h3 className="text-lg font-medium text-white">Thông tin chuyển khoản</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Ngân hàng:</span>
                      <span className="text-white font-medium">{bankInfo.bank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Chi nhánh:</span>
                      <span className="text-white font-medium">{bankInfo.branch}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Chủ tài khoản:</span>
                      <span className="text-white font-medium">{bankInfo.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Số tài khoản:</span>
                      <div className="flex items-center">
                        <span className="text-white font-medium mr-2">{bankInfo.number}</span>
                        <button
                          onClick={() => handleCopy(bankInfo.number)}
                          className="p-1.5 bg-slate-600/50 hover:bg-slate-600 rounded text-gray-300 transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nội dung chuyển khoản:</span>
                      <div className="flex items-center">
                        <span className="text-white font-medium mr-2">{bankInfo.content}</span>
                        <button
                          onClick={() => handleCopy(bankInfo.content)}
                          className="p-1.5 bg-slate-600/50 hover:bg-slate-600 rounded text-gray-300 transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <p className="text-gray-300 mb-6 text-center">
                  Vui lòng chuyển khoản theo thông tin trên và nhấn "Đã thanh toán" sau khi hoàn tất
                </p>
              </motion.div>
            )}

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4"
            >
              <button
                onClick={handleCancelPayment}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Hủy thanh toán
              </button>
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-dark font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark mr-3"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    Đã thanh toán
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default Payment
