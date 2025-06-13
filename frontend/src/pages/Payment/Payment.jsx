"use client"

import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"

// Components
import PaymentContainer from "../../components/payment/PaymentContainer"
import PaymentHeader from "../../components/payment/PaymentHeader"
import PaymentNotice from "../../components/payment/PaymentNotice"
import VNPayMethod from "../../components/payment/VNPayMethod"
import MoMoMethod from "../../components/payment/MoMoMethod"
import BankTransferMethod from "../../components/payment/BankTransferMethod"
import PaymentActions from "../../components/payment/PaymentActions"

// Hooks
import usePayment from "../../hooks/usePayment"

const Payment = () => {
  const { method, orderId } = useParams()
  const { url } = useContext(StoreContext)

  // Sử dụng custom hook để quản lý logic thanh toán
  const { isProcessing, handleCompletePayment, handleCancelPayment } = usePayment(orderId, method, url)

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

  // Render phương thức thanh toán tương ứng
  const renderPaymentMethod = () => {
    switch (method) {
      case "VNPay":
        return <VNPayMethod />
      case "MoMo":
        return <MoMoMethod walletInfo={walletInfo} />
      case "BankTransfer":
        return <BankTransferMethod bankInfo={bankInfo} />
      default:
        return <BankTransferMethod bankInfo={bankInfo} />
    }
  }

  return (
    <PaymentContainer>
      <PaymentHeader onBack={handleCancelPayment} title="Thanh toán đơn hàng" />
      <PaymentNotice initialSeconds={300} />

      {renderPaymentMethod()}

      <PaymentActions onCancel={handleCancelPayment} onComplete={handleCompletePayment} isProcessing={isProcessing} />

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
    </PaymentContainer>
  )
}

export default Payment
