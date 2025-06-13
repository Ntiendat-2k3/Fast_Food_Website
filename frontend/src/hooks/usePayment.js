"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import axios from "axios"

const usePayment = (orderId, method, apiUrl) => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  // Xử lý hoàn thành thanh toán
  const handleCompletePayment = async () => {
    setIsProcessing(true)
    console.log("Completing payment for order:", orderId)

    try {
      // Gọi API để cập nhật trạng thái thanh toán
      const response = await axios.post(`${apiUrl}/api/order/verify`, {
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
      await axios.post(`${apiUrl}/api/order/verify`, {
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

  return {
    isProcessing,
    handleCompletePayment,
    handleCancelPayment,
  }
}

export default usePayment
