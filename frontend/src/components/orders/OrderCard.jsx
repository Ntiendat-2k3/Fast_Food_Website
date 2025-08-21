"use client"

import { motion } from "framer-motion"
import {
  Calendar,
  MapPin,
  Phone,
  Package,
  CheckCircle,
  Clock,
  CreditCard,
  ShoppingCart,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import OrderStatusBadge from "./OrderStatusBadge"
import PaymentStatusBadge from "./PaymentStatusBadge"
import PaymentMethodIcon from "./PaymentMethodIcon"
import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { StoreContext } from "../../context/StoreContext"
import CancelOrderModal from "./CancelOrderModal"

const OrderCard = ({ order, url, formatDate, onOrderUpdate, confirmDelivery }) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const { addToCart, food_list } = useContext(StoreContext)
  const navigate = useNavigate()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancelOrder = async (reason) => {
    try {
      setIsCancelling(true)

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Vui lòng đăng nhập để thực hiện thao tác này")
        return
      }

      console.log("Sending cancel request with:", {
        orderId: order._id,
        cancelReason: reason,
      })

      const response = await fetch(`${url}/api/order/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          orderId: order._id,
          cancelReason: reason,
        }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (data.success) {
        toast.success(data.message || "Đã hủy đơn hàng thành công!")
        setShowCancelModal(false)

        // Gọi callback để refresh danh sách đơn hàng
        if (onOrderUpdate) {
          onOrderUpdate()
        }
      } else {
        toast.error(data.message || "Lỗi khi hủy đơn hàng")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast.error("Lỗi kết nối. Vui lòng thử lại!")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleProductClick = (productName) => {
    // Tìm sản phẩm trong food_list
    const product = food_list.find((item) => item.name === productName)
    if (product) {
      // Tạo slug từ tên sản phẩm
      const slug = product.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()

      // Navigate đến trang chi tiết sản phẩm
      navigate(`/product/${slug}`)
    } else {
      toast.error("Sản phẩm không tồn tại!")
    }
  }

  const handleConfirmDelivery = async () => {
    try {
      setIsConfirming(true)
      await confirmDelivery(order._id)
      toast.success("Đã xác nhận nhận hàng thành công!")
      if (onOrderUpdate) {
        onOrderUpdate()
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi xác nhận nhận hàng")
    } finally {
      setIsConfirming(false)
    }
  }

  const handleReorder = async () => {
    try {
      setIsReordering(true)
      let addedItems = 0
      const unavailableItems = []

      for (const item of order.items) {
        const foodItem = food_list.find((food) => food.name === item.name)

        if (foodItem) {
          await addToCart(item.name, item.quantity)
          addedItems++
        } else {
          unavailableItems.push(item.name)
        }
      }

      if (addedItems > 0) {
        toast.success(`Đã thêm ${addedItems} sản phẩm vào giỏ hàng!`)
      }

      if (unavailableItems.length > 0) {
        toast.error(`Một số sản phẩm không còn khả dụng: ${unavailableItems.join(", ")}`)
      }

      if (addedItems === 0) {
        toast.error("Không có sản phẩm nào có thể thêm vào giỏ hàng")
      }
    } catch (error) {
      console.error("Error reordering:", error)
      toast.error("Lỗi khi mua lại đơn hàng")
    } finally {
      setIsReordering(false)
    }
  }

  const canConfirmDelivery = order.status === "Đã giao" && !order.customerConfirmed
  const isCompleted = order.status === "Đã hoàn thành" || order.customerConfirmed
  const canCancelOrder = order.status === "Đang xử lý"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-yellow-500/30 overflow-hidden hover:shadow-2xl hover:border-yellow-400/50 transition-all duration-300"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700/80 to-slate-800/80 px-6 py-4 border-b border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <Package className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Đơn hàng #{order._id.slice(-6).toUpperCase()}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(order.date)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Order Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Package className="w-4 h-4" />
                Thông tin đơn hàng
              </h4>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30 hover:border-yellow-500/30 transition-colors cursor-pointer group"
                    onClick={() => handleProductClick(item.name)}
                  >
                    <div className="w-12 h-12 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0 border border-yellow-500/20">
                      <img
                        src={url + "/images/" + item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=48&width=48"
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-yellow-400 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-yellow-400">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-lg p-4 space-y-2 border border-yellow-500/20">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Tổng phụ:</span>
                  <span>{(order.itemsTotal || order.subtotal || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Phí vận chuyển:</span>
                  <span>{(order.shippingFee || order.deliveryFee || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Giảm giá:</span>
                    <span>-{order.discountAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="border-t border-yellow-500/20 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Tổng cộng:</span>
                    <span className="text-yellow-400">{order.amount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Customer Information */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Thông tin khách hàng
              </h4>

              <div className="space-y-4">
                {/* Customer Details */}
                <div className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-lg p-4 space-y-3 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <Phone className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{order.address.name}</p>
                      <p className="text-sm text-slate-300">{order.address.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg mt-1 border border-yellow-500/30">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <CreditCard className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Phương thức thanh toán</p>
                      <div className="flex items-center gap-2 mt-1">
                        <PaymentMethodIcon method={order.paymentMethod} />
                        <span className="text-sm text-slate-300">{order.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {order.voucherCode && (
                    <div className="mt-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <p className="text-sm text-green-400">
                        <span className="font-medium">Mã giảm giá:</span> {order.voucherCode}
                      </p>
                      <p className="text-sm text-green-300">
                        Tiết kiệm: {order.discountAmount?.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-yellow-500/20 space-y-4">
          {/* Cancel Order Button */}
          {canCancelOrder && (
            <div className="flex items-center justify-between bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300 font-medium">Bạn muốn hủy đơn hàng này?</span>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <XCircle className="w-4 h-4" />
                <span>Hủy đơn hàng</span>
              </button>
            </div>
          )}

          {/* Confirm Delivery Button */}
          {canConfirmDelivery && (
            <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-300 font-medium">
                  Đơn hàng đã được giao. Vui lòng xác nhận đã nhận hàng.
                </span>
              </div>
              <button
                onClick={handleConfirmDelivery}
                disabled={isConfirming}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Đã nhận hàng</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Reorder Button for Completed Orders */}
          {isCompleted && (
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-300 font-medium">Bạn muốn đặt lại những món này?</span>
              </div>
              <button
                onClick={handleReorder}
                disabled={isReordering}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isReordering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang thêm...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Mua lại</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Status */}
        {order.customerConfirmed && (
          <div className="mt-4 pt-4 border-t border-yellow-500/20">
            <div className="flex items-center gap-2 text-green-400 bg-green-500/20 rounded-lg p-3 border border-green-500/30">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Đã xác nhận nhận hàng {order.customerConfirmedAt && `vào ${formatDate(order.customerConfirmedAt)}`}
              </span>
            </div>
          </div>
        )}

        {/* Cancel reason display */}
        {order.status === "Đã hủy" && order.cancelReason && (
          <div className="mt-4 pt-4 border-t border-yellow-500/20">
            <div className="flex items-center gap-2 text-red-400 bg-red-500/20 rounded-lg p-3 border border-red-500/30">
              <XCircle className="w-5 h-5" />
              <div className="text-sm">
                <span className="font-medium">Đơn hàng đã bị hủy</span>
                <p className="text-red-300 mt-1">Lý do: {order.cancelReason}</p>
                {order.cancelledAt && (
                  <p className="text-red-300 text-xs mt-1">Thời gian: {formatDate(order.cancelledAt)}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />
    </motion.div>
  )
}

export default OrderCard
