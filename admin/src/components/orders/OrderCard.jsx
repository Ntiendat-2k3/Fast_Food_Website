"use client"

import { useState } from "react"
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Check,
  FileText,
} from "lucide-react"
import OrderItemsList from "./OrderItemsList"
import OrderSummary from "./OrderSummary"

const OrderCard = ({ order, onStatusChange, onCancelOrder, formatDate, formatCurrency, onExportInvoice }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusSteps = [
    { key: "Đang xử lý", label: "Đang xử lý", icon: Clock, color: "orange" },
    { key: "Đang giao hàng", label: "Đang giao hàng", icon: Truck, color: "blue" },
    { key: "Đã giao", label: "Đã giao", icon: CheckCircle, color: "green" },
  ]

  const getCurrentStepIndex = () => {
    if (order.status === "Đã hủy" || order.status === "Đã hoàn thành") return -1
    return statusSteps.findIndex((step) => step.key === order.status)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý":
        return {
          bg: "from-orange-500/20 to-orange-600/20",
          border: "border-orange-500/30",
          text: "text-orange-400",
          icon: Clock,
        }
      case "Đang giao hàng":
        return {
          bg: "from-blue-500/20 to-blue-600/20",
          border: "border-blue-500/30",
          text: "text-blue-400",
          icon: Truck,
        }
      case "Đã giao":
        return {
          bg: "from-green-500/20 to-green-600/20",
          border: "border-green-500/30",
          text: "text-green-400",
          icon: CheckCircle,
        }
      case "Đã hoàn thành":
        return {
          bg: "from-emerald-500/20 to-emerald-600/20",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          icon: CheckCircle,
        }
      case "Đã hủy":
        return {
          bg: "from-red-500/20 to-red-600/20",
          border: "border-red-500/30",
          text: "text-red-400",
          icon: XCircle,
        }
      default:
        return {
          bg: "from-gray-500/20 to-gray-600/20",
          border: "border-gray-500/30",
          text: "text-gray-400",
          icon: AlertCircle,
        }
    }
  }

  const getPaymentMethodInfo = (method) => {
    switch (method?.toLowerCase()) {
      case "momo":
        return {
          icon: Smartphone,
          color: "text-pink-400",
          bg: "bg-pink-500/20",
          label: "MoMo",
        }
      case "vnpay":
        return {
          icon: CreditCard,
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          label: "VNPay",
        }
      case "banking":
      case "bank":
        return {
          icon: Building,
          color: "text-green-400",
          bg: "bg-green-500/20",
          label: "Chuyển khoản",
        }
      case "cod":
      default:
        return {
          icon: Banknote,
          color: "text-orange-400",
          bg: "bg-orange-500/20",
          label: "Thanh toán khi nhận hàng",
        }
    }
  }

  // Tự động hiển thị trạng thái thanh toán dựa trên trạng thái đơn hàng
  const getDisplayPaymentStatus = () => {
    if (order.status === "Đã giao" || order.status === "Đã hoàn thành") {
      return "Đã thanh toán"
    }
    return order.paymentStatus || "Chưa thanh toán"
  }

  const getPaymentStatusColor = () => {
    const status = getDisplayPaymentStatus()
    switch (status) {
      case "Đã thanh toán":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Đang xử lý":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Thanh toán thất bại":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    }
  }

  const handleStatusChange = async (newStatus) => {
    const currentIndex = getCurrentStepIndex()
    const newIndex = statusSteps.findIndex((step) => step.key === newStatus)

    // Không cho phép lùi lại hoặc nhảy cách (trừ khi đã hoàn thành)
    if (order.status !== "Đã hoàn thành" && (newIndex <= currentIndex || newIndex > currentIndex + 1)) {
      return
    }

    setIsUpdating(true)
    await onStatusChange({ target: { value: newStatus } }, order._id)
    setIsUpdating(false)
  }

  const handleCancelOrder = async () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      setIsUpdating(true)
      await onCancelOrder(order._id)
      setIsUpdating(false)
    }
  }

  const statusConfig = getStatusColor(order.status)
  const StatusIcon = statusConfig.icon
  const paymentInfo = getPaymentMethodInfo(order.paymentMethod)
  const PaymentIcon = paymentInfo.icon
  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="order-card-compact p-4 hover-lift">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">#{order._id.slice(-6).toUpperCase()}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{order.address.name}</span>
              <span className="mx-0.5">•</span>
              <span>{order.address.phone}</span>
              <span className="mx-0.5">•</span>
              <span>{formatCurrency ? formatCurrency(order.amount) : `${order.amount.toLocaleString()} đ`}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Compact Status Badge */}
          <div
            className={`status-badge-compact bg-gradient-to-r ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{order.status}</span>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-gray-800/50 border border-gray-600 text-gray-400 hover:text-amber-400 hover:border-amber-400/50 transition-all duration-300"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Basic Info Row */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate ? formatDate(order.date) : new Date(order.date).toLocaleDateString("vi-VN")}
        </div>
        <div className="flex items-center gap-1">
          <PaymentIcon className={`w-3 h-3 ${paymentInfo.color}`} />
          <span>{paymentInfo.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Package className="w-3 h-3" />
          {order.items.length} món
        </div>
      </div>

      {/* Payment Status */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className={`px-2 py-1 rounded-full border ${getPaymentStatusColor()}`}>{getDisplayPaymentStatus()}</div>
        <div className="text-gray-400">
          {order.voucherCode && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
              Voucher: {order.voucherCode}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Row - Always visible for admin */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Nút hủy đơn hàng - chỉ hiện khi đang xử lý */}
          {order.status === "Đang xử lý" && (
            <button
              onClick={handleCancelOrder}
              disabled={isUpdating}
              className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Hủy đơn
            </button>
          )}

          {/* Loading indicator */}
          {isUpdating && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-amber-400">Đang cập nhật...</span>
            </div>
          )}
        </div>

        {/* Export Invoice Button */}
        <button
          onClick={() => onExportInvoice(order._id)}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-1 text-xs"
        >
          <FileText className="w-3 h-3" />
          Xuất hóa đơn
        </button>
      </div>

      {/* Shopee-style Progress Bar - Only show for orders in progress */}
      {order.status !== "Đã hoàn thành" && order.status !== "Đã hủy" && (
        <div className="p-2.5 bg-gray-800/30 rounded-lg border border-gray-700/50 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Tiến trình đơn hàng</span>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-5 right-5 h-0.5 bg-gray-600 z-0"></div>
            <div
              className="absolute top-4 left-5 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 z-10"
              style={{
                width: currentStepIndex >= 0 ? `${((currentStepIndex + 1) / statusSteps.length) * 100}%` : "0%",
              }}
            ></div>

            {/* Steps */}
            <div className="relative flex justify-between z-20">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index < currentStepIndex
                const isActive = index === currentStepIndex
                const isClickable =
                  index === currentStepIndex + 1 && order.status !== "Đã giao" && order.status !== "Đã hoàn thành"

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    {/* Step Circle */}
                    <button
                      onClick={() => isClickable && handleStatusChange(step.key)}
                      disabled={!isClickable || isUpdating}
                      className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center mb-1 transition-all duration-300 relative
                        ${
                          isCompleted
                            ? "bg-gradient-to-r from-green-500 to-green-600 border-green-500 shadow-lg shadow-green-500/30"
                            : isActive
                              ? `bg-gradient-to-r from-${step.color}-500 to-${step.color}-600 border-${step.color}-500 shadow-lg animate-pulse`
                              : isClickable
                                ? "bg-gray-700 border-gray-600 hover:border-amber-400 hover:bg-gray-600 cursor-pointer"
                                : "bg-gray-700 border-gray-600 cursor-not-allowed"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <StepIcon
                          className={`w-4 h-4 ${
                            isActive ? "text-white" : isClickable ? "text-gray-300" : "text-gray-500"
                          }`}
                        />
                      )}

                      {/* Pulse effect for active step */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-500/20 animate-ping"></div>
                      )}
                    </button>

                    {/* Step Label */}
                    <div className="text-center">
                      <p
                        className={`text-[10px] font-medium mb-0.5 ${
                          isCompleted ? "text-green-400" : isActive ? "text-amber-400" : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCompleted && <p className="text-[9px] text-green-500">✓ Hoàn thành</p>}
                      {isActive && <p className="text-[9px] text-amber-400">Đang thực hiện</p>}
                      {isClickable && (
                        <p className="text-[9px] text-gray-400 hover:text-amber-400 transition-colors">
                          Click để tiếp tục
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Progress Percentage */}
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-400">
                Tiến độ:{" "}
                <span className="text-amber-400 font-medium">
                  {currentStepIndex >= 0 ? Math.round(((currentStepIndex + 1) / statusSteps.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Special status displays */}
      {order.status === "Đã giao" && (
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-400">Đơn hàng đã được giao</span>
          </div>
          <div className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-500/30">
            Chờ khách hàng xác nhận
          </div>
        </div>
      )}

      {/* Display "Đơn hàng đã hoàn thành" only when status is actually "Đã hoàn thành" */}
      {order.status === "Đã hoàn thành" && (
        <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 flex items-center justify-center mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
          <span className="text-sm font-medium text-emerald-400">Đơn hàng đã hoàn thành</span>
        </div>
      )}

      {/* Display "Đơn hàng đã bị hủy" if status is "Đã hủy" */}
      {order.status === "Đã hủy" && (
        <div className="flex items-center justify-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-3">
          <XCircle className="w-4 h-4 text-red-400 mr-2" />
          <span className="text-sm font-medium text-red-400">Đơn hàng đã bị hủy</span>
        </div>
      )}

      {/* Expandable Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Thông tin khách hàng
              </h4>
              <div className="space-y-1 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-gray-500" />
                  {order.address.name}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-gray-500" />
                  {order.address.phone}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Địa chỉ giao hàng
              </h4>
              <div className="text-xs text-gray-300 leading-relaxed">
                <p>{order.address.street}</p>
                <p>
                  {order.address.ward}, {order.address.district}
                </p>
                <p>
                  {order.address.province}, {order.address.zipcode}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Chi tiết thanh toán</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Phương thức:</span>
                <div className="flex items-center gap-2 mt-1">
                  <PaymentIcon className={`w-4 h-4 ${paymentInfo.color}`} />
                  <span className="text-white">{paymentInfo.label}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Trạng thái:</span>
                <div className={`mt-1 px-2 py-1 rounded border ${getPaymentStatusColor()} inline-block`}>
                  {getDisplayPaymentStatus()}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Món ăn ({order.items.length})
            </h4>
            <OrderItemsList items={order.items} />
          </div>

          {/* Order Summary */}
          <OrderSummary order={order} formatCurrency={formatCurrency} />
        </div>
      )}
    </div>
  )
}

export default OrderCard
