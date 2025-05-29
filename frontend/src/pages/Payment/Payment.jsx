"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ArrowLeft, Copy, CheckCircle, Landmark } from "lucide-react"
import axios from "axios"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"

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

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden mt-20 mx-4 md:mx-auto max-w-3xl transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={handleCancelPayment}
            className="p-2 bg-gray-100 dark:bg-dark-lighter rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark transition-colors mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Thanh toán đơn hàng</h1>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
          <p className="text-blue-700 dark:text-blue-300">
            Vui lòng hoàn tất thanh toán trong <span className="font-bold">{formatTime(countdown)}</span>. Đơn hàng của
            bạn sẽ được xác nhận sau khi thanh toán thành công.
          </p>
        </div>

        {method === "VNPay" && (
          <div className="text-center py-6">
            <div className="bg-white p-4 rounded-lg shadow-md inline-block mb-6">
              <img
                src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png"
                alt="VNPay QR Code"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Quét mã QR bằng ứng dụng ngân hàng hoặc ví VNPay để thanh toán
            </p>
          </div>
        )}

        {method === "MoMo" && (
          <div className="text-center py-6">
            <div className="bg-white p-4 rounded-lg shadow-md inline-block mb-6">
              <img
                src="https://developers.momo.vn/v3/vi/assets/images/logo-momo-300-8126a80b5591add9f25a8b9f26c7ecf4.jpg"
                alt="MoMo QR Code"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>
            <div className="bg-gray-50 dark:bg-dark-light p-4 rounded-lg mb-6 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Số điện thoại:</span>
                <div className="flex items-center">
                  <span className="text-dark dark:text-white font-medium mr-2">{walletInfo.phone}</span>
                  <button
                    onClick={() => handleCopy(walletInfo.phone)}
                    className="p-1 bg-gray-100 dark:bg-dark-lighter rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Người nhận:</span>
                <span className="text-dark dark:text-white font-medium">{walletInfo.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Nội dung chuyển khoản:</span>
                <div className="flex items-center">
                  <span className="text-dark dark:text-white font-medium mr-2">{walletInfo.content}</span>
                  <button
                    onClick={() => handleCopy(walletInfo.content)}
                    className="p-1 bg-gray-100 dark:bg-dark-lighter rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Quét mã QR bằng ứng dụng MoMo hoặc chuyển khoản theo thông tin trên
            </p>
          </div>
        )}

        {method === "BankTransfer" && (
          <div className="py-6">
            <div className="bg-gray-50 dark:bg-dark-light p-6 rounded-lg mb-6">
              <div className="flex items-center mb-4">
                <Landmark size={24} className="text-primary mr-2" />
                <h3 className="text-lg font-medium text-dark dark:text-white">Thông tin chuyển khoản</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Ngân hàng:</span>
                  <span className="text-dark dark:text-white font-medium">{bankInfo.bank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Chi nhánh:</span>
                  <span className="text-dark dark:text-white font-medium">{bankInfo.branch}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Chủ tài khoản:</span>
                  <span className="text-dark dark:text-white font-medium">{bankInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Số tài khoản:</span>
                  <div className="flex items-center">
                    <span className="text-dark dark:text-white font-medium mr-2">{bankInfo.number}</span>
                    <button
                      onClick={() => handleCopy(bankInfo.number)}
                      className="p-1 bg-gray-100 dark:bg-dark-lighter rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Nội dung chuyển khoản:</span>
                  <div className="flex items-center">
                    <span className="text-dark dark:text-white font-medium mr-2">{bankInfo.content}</span>
                    <button
                      onClick={() => handleCopy(bankInfo.content)}
                      className="p-1 bg-gray-100 dark:bg-dark-lighter rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              Vui lòng chuyển khoản theo thông tin trên và nhấn "Đã thanh toán" sau khi hoàn tất
            </p>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCancelPayment}
            className="px-6 py-3 bg-gray-100 dark:bg-dark-lighter text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-dark"
          >
            Hủy thanh toán
          </button>
          <button
            onClick={handleCompletePayment}
            disabled={isProcessing}
            className="px-6 py-3 bg-primary hover:bg-primary-light text-dark font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
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
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Payment
