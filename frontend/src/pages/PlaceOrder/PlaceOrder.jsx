"use client"

import { useEffect, useState } from "react"
import { useContext } from "react"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  CreditCard,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Info,
  CreditCardIcon as CardIcon,
  Wallet,
  Landmark,
  Truck,
  Tag,
  Sparkles,
  ShieldCheck,
  Gift,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { motion } from "framer-motion"

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext)
  const location = useLocation()
  const appliedVoucher = location.state?.appliedVoucher || null
  const buyNowMode = location.state?.buyNowMode || false
  const tempCartItems = location.state?.tempCartItems || {}
  const singleProduct = location.state?.singleProduct || null

  const [data, setData] = useState({
    name: "",
    street: "",
    phone: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errors, setErrors] = useState({
    name: "",
    street: "",
    phone: "",
  })

  const [voucherCode, setVoucherCode] = useState("")
  const [currentAppliedVoucher, setCurrentAppliedVoucher] = useState(appliedVoucher)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [voucherError, setVoucherError] = useState("")
  const [availableVouchers, setAvailableVouchers] = useState([])
  const [showVoucherList, setShowVoucherList] = useState(false)
  const [loadingVouchers, setLoadingVouchers] = useState(false)

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData((data) => ({ ...data, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { name: "", street: "", phone: "" }

    // Validate name
    if (!data.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên người nhận"
      isValid = false
    } else if (data.name.trim().length < 3) {
      newErrors.name = "Họ tên phải có ít nhất 3 ký tự"
      isValid = false
    }

    // Validate address
    if (!data.street.trim()) {
      newErrors.street = "Vui lòng nhập địa chỉ giao hàng"
      isValid = false
    } else if (data.street.trim().length < 10) {
      newErrors.street = "Địa chỉ phải đầy đủ và chi tiết (ít nhất 10 ký tự)"
      isValid = false
    }

    // Validate phone - Vietnamese phone number format
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
    if (!data.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
      isValid = false
    } else if (!phoneRegex.test(data.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Tính tổng giá trị đơn hàng chính xác
  const calculateOrderAmount = () => {
    if (buyNowMode && singleProduct) {
      return singleProduct.price * singleProduct.quantity
    }

    let totalAmount = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product.name === item)
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item]
        }
      }
    }
    return totalAmount
  }

  // Lấy danh sách voucher có sẵn
  const fetchAvailableVouchers = async () => {
    setLoadingVouchers(true)
    try {
      const response = await axios.get(`${url}/api/voucher/active`)
      if (response.data.success) {
        setAvailableVouchers(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error)
    } finally {
      setLoadingVouchers(false)
    }
  }

  const handleApplyVoucher = async (code = voucherCode) => {
    if (!code.trim()) {
      setVoucherError("Vui lòng nhập mã giảm giá")
      return
    }

    setIsApplyingVoucher(true)
    setVoucherError("")

    try {
      const orderAmount = calculateOrderAmount()
      const response = await axios.post(`${url}/api/voucher/apply`, {
        code: code,
        orderAmount: orderAmount,
      })

      if (response.data.success) {
        setCurrentAppliedVoucher(response.data.data)
        setVoucherCode(code)
        setShowVoucherList(false)
        toast.success("Áp dụng mã giảm giá thành công")
      } else {
        setVoucherError(response.data.message || "Mã giảm giá không hợp lệ")
      }
    } catch (error) {
      console.error("Error applying voucher:", error)
      setVoucherError("Đã xảy ra lỗi khi áp dụng mã giảm giá")
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setCurrentAppliedVoucher(null)
    setVoucherCode("")
    setVoucherError("")
    toast.info("Đã xóa mã giảm giá")
  }

  const handleSelectVoucher = (voucher) => {
    const orderAmount = calculateOrderAmount()
    if (orderAmount < voucher.minOrderValue) {
      toast.error(`Giá trị đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ`)
      return
    }
    handleApplyVoucher(voucher.code)
  }

  const placeOrder = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin giao hàng")
      return
    }

    setIsSubmitting(true)

    const orderItems = []

    if (buyNowMode && singleProduct) {
      // Chỉ thêm sản phẩm được mua ngay
      orderItems.push({
        ...singleProduct,
        quantity: singleProduct.quantity,
      })
    } else {
      // Thêm tất cả sản phẩm trong giỏ hàng
      food_list.map((item) => {
        if (cartItems[item.name] > 0) {
          const itemInfo = { ...item }
          itemInfo["quantity"] = cartItems[item.name]
          orderItems.push(itemInfo)
        }
      })
    }

    // Calculate final amount with discount
    const subtotal = calculateOrderAmount()
    const shippingFee = 14000
    let discountAmount = 0

    if (currentAppliedVoucher) {
      if (currentAppliedVoucher.voucherInfo.discountType === "percentage") {
        discountAmount = (subtotal * currentAppliedVoucher.voucherInfo.discountValue) / 100

        if (
          currentAppliedVoucher.voucherInfo.maxDiscountAmount &&
          discountAmount > currentAppliedVoucher.voucherInfo.maxDiscountAmount
        ) {
          discountAmount = currentAppliedVoucher.voucherInfo.maxDiscountAmount
        }
      } else {
        discountAmount = currentAppliedVoucher.voucherInfo.discountValue
      }
    }

    const finalAmount = subtotal + shippingFee - discountAmount

    const orderData = {
      address: data,
      items: orderItems,
      amount: finalAmount,
      paymentMethod: paymentMethod,
      voucherId: currentAppliedVoucher?.voucherInfo?._id || null,
      discountAmount: discountAmount,
    }

    try {
      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      })

      if (response.data.success) {
        // Chỉ xóa giỏ hàng nếu không phải chế độ mua ngay
        if (!buyNowMode) {
          setCartItems({})
        }

        console.log("Order placed successfully:", response.data)

        if (paymentMethod === "COD") {
          navigate("/thankyou")
        } else {
          navigate(`/payment/${paymentMethod}/${response.data.orderId}`)
        }
      } else {
        toast.error(response.data.message || "Đã xảy ra lỗi khi đặt hàng")
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error)
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate("/cart")
    } else if (!buyNowMode && getTotalCartAmount() === 0) {
      navigate("/cart")
    }
  }, [token, buyNowMode])

  useEffect(() => {
    fetchAvailableVouchers()
  }, [])

  // Calculate final amount with discount
  const getFinalAmount = () => {
    const subtotal = calculateOrderAmount()
    const shippingFee = 14000

    if (!currentAppliedVoucher) {
      return subtotal + shippingFee
    }

    let discountAmount = 0
    if (currentAppliedVoucher.voucherInfo.discountType === "percentage") {
      discountAmount = (subtotal * currentAppliedVoucher.voucherInfo.discountValue) / 100

      // Apply max discount if set
      if (
        currentAppliedVoucher.voucherInfo.maxDiscountAmount &&
        discountAmount > currentAppliedVoucher.voucherInfo.maxDiscountAmount
      ) {
        discountAmount = currentAppliedVoucher.voucherInfo.maxDiscountAmount
      }
    } else {
      discountAmount = currentAppliedVoucher.voucherInfo.discountValue
    }

    return subtotal + shippingFee - discountAmount
  }

  const paymentMethods = [
    {
      id: "COD",
      name: "Thanh toán khi nhận hàng (COD)",
      icon: <Truck size={20} className="text-gray-300" />,
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
    },
    {
      id: "VNPay",
      name: "VNPay",
      icon: <CardIcon size={20} className="text-blue-400" />,
      description: "Thanh toán qua ví điện tử VNPay",
    },
    {
      id: "MoMo",
      name: "Ví MoMo",
      icon: <Wallet size={20} className="text-pink-400" />,
      description: "Thanh toán qua ví điện tử MoMo",
    },
    {
      id: "BankTransfer",
      name: "Chuyển khoản ngân hàng",
      icon: <Landmark size={20} className="text-green-400" />,
      description: "Chuyển khoản qua ngân hàng",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
        >
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <div className="flex items-center">
              <Sparkles className="text-yellow-400 mr-3" size={24} />
              <h1 className="text-2xl font-bold text-white">Thanh toán</h1>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <ShieldCheck className="mr-2 text-yellow-400" size={20} />
                  Thông tin vận chuyển
                </h2>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-300">
                        Vui lòng nhập đầy đủ thông tin giao hàng để đảm bảo đơn hàng được giao đến đúng địa chỉ.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={placeOrder} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      className={`w-full bg-slate-700/50 text-white border ${
                        errors.name ? "border-red-500" : "border-slate-600"
                      } rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
                      required
                      name="name"
                      onChange={onChangeHandler}
                      value={data.name}
                      type="text"
                      placeholder="Họ tên người nhận"
                    />
                    {errors.name && (
                      <div className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      className={`w-full bg-slate-700/50 text-white border ${
                        errors.street ? "border-red-500" : "border-slate-600"
                      } rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent min-h-[100px]`}
                      required
                      name="street"
                      onChange={onChangeHandler}
                      value={data.street}
                      placeholder="Địa chỉ giao hàng chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                    />
                    {errors.street && (
                      <div className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.street}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      className={`w-full bg-slate-700/50 text-white border ${
                        errors.phone ? "border-red-500" : "border-slate-600"
                      } rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent`}
                      required
                      name="phone"
                      onChange={onChangeHandler}
                      value={data.phone}
                      type="text"
                      placeholder="Số điện thoại liên hệ (VD: 0912345678)"
                    />
                    {errors.phone && (
                      <div className="text-red-400 text-sm mt-1 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-4">Phương thức thanh toán</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border ${
                            paymentMethod === method.id
                              ? "border-yellow-400 bg-yellow-400/10"
                              : "border-slate-600 bg-slate-700/30"
                          } rounded-xl p-4 cursor-pointer hover:border-yellow-400/50 transition-all duration-300`}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full border-2 ${
                                paymentMethod === method.id ? "border-yellow-400" : "border-gray-400"
                              } flex items-center justify-center mr-3`}
                            >
                              {paymentMethod === method.id && (
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                              )}
                            </div>
                            <div className="flex items-center flex-1">
                              {method.icon}
                              <div className="ml-3">
                                <span className="text-white font-medium">{method.name}</span>
                                <p className="text-gray-400 text-sm">{method.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-3 rounded-xl flex items-center justify-center transition-all duration-300 mt-6 disabled:opacity-70 font-medium hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mr-3"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} className="mr-2" />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Đơn hàng của bạn</h2>
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {buyNowMode && singleProduct ? (
                      // Hiển thị chỉ sản phẩm được mua ngay
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={url + "/images/" + singleProduct.image || "/placeholder.svg"}
                            alt={singleProduct.name}
                            className="w-12 h-12 object-cover rounded-lg mr-3 border border-slate-600"
                          />
                          <div>
                            <p className="text-white">{singleProduct.name}</p>
                            <p className="text-gray-400 text-sm">
                              {singleProduct.price.toLocaleString("vi-VN")} đ x {singleProduct.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-yellow-400 font-medium">
                          {(singleProduct.price * singleProduct.quantity).toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    ) : (
                      // Hiển thị tất cả sản phẩm trong giỏ hàng
                      food_list.map((item, index) => {
                        if (cartItems[item.name] > 0) {
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <img
                                  src={url + "/images/" + item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg mr-3 border border-slate-600"
                                />
                                <div>
                                  <p className="text-white">{item.name}</p>
                                  <p className="text-gray-400 text-sm">
                                    {item.price.toLocaleString("vi-VN")} đ x {cartItems[item.name]}
                                  </p>
                                </div>
                              </div>
                              <p className="text-yellow-400 font-medium">
                                {(item.price * cartItems[item.name]).toLocaleString("vi-VN")} đ
                              </p>
                            </div>
                          )
                        }
                        return null
                      })
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-600 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tạm tính</span>
                      <span className="text-white">{calculateOrderAmount().toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phí vận chuyển</span>
                      <span className="text-white">14.000 đ</span>
                    </div>

                    {currentAppliedVoucher && (
                      <div className="flex justify-between text-green-400">
                        <div className="flex items-center">
                          <Tag size={16} className="mr-2" />
                          <span>Giảm giá ({currentAppliedVoucher.voucherInfo.code})</span>
                        </div>
                        <span>- {currentAppliedVoucher.discountAmount.toLocaleString("vi-VN")} đ</span>
                      </div>
                    )}

                    {/* Voucher Section */}
                    <div className="border-t border-slate-600 pt-3 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-300">Mã giảm giá</label>
                        <button
                          onClick={() => setShowVoucherList(!showVoucherList)}
                          className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center"
                        >
                          <Gift size={16} className="mr-1" />
                          Chọn voucher
                          {showVoucherList ? (
                            <ChevronUp size={16} className="ml-1" />
                          ) : (
                            <ChevronDown size={16} className="ml-1" />
                          )}
                        </button>
                      </div>

                      {/* Applied Voucher Display */}
                      {currentAppliedVoucher && (
                        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Check size={16} className="text-green-400 mr-2" />
                              <div>
                                <p className="text-green-300 font-medium text-sm">
                                  {currentAppliedVoucher.voucherInfo.code}
                                </p>
                                <p className="text-green-400 text-xs">
                                  {currentAppliedVoucher.voucherInfo.discountType === "percentage"
                                    ? `Giảm ${currentAppliedVoucher.voucherInfo.discountValue}%`
                                    : `Giảm ${currentAppliedVoucher.voucherInfo.discountValue.toLocaleString("vi-VN")}đ`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveVoucher}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Available Vouchers List */}
                      {showVoucherList && (
                        <div className="mb-3 max-h-48 overflow-y-auto">
                          {loadingVouchers ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto"></div>
                              <p className="text-gray-400 text-sm mt-2">Đang tải voucher...</p>
                            </div>
                          ) : availableVouchers.length > 0 ? (
                            <div className="space-y-2">
                              {availableVouchers.map((voucher) => {
                                const orderAmount = calculateOrderAmount()
                                const isEligible = orderAmount >= voucher.minOrderValue
                                const isSelected = currentAppliedVoucher?.voucherInfo?.code === voucher.code

                                return (
                                  <div
                                    key={voucher._id}
                                    className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                                      isSelected
                                        ? "border-green-400 bg-green-500/10"
                                        : isEligible
                                          ? "border-slate-600 bg-slate-700/30 hover:border-yellow-400/50"
                                          : "border-slate-600 bg-slate-700/10 opacity-50 cursor-not-allowed"
                                    }`}
                                    onClick={() => isEligible && !isSelected && handleSelectVoucher(voucher)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center">
                                          <Tag size={14} className="text-yellow-400 mr-2" />
                                          <span className="text-white font-medium text-sm">{voucher.code}</span>
                                          {isSelected && <Check size={14} className="text-green-400 ml-2" />}
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1">
                                          {voucher.discountType === "percentage"
                                            ? `Giảm ${voucher.discountValue}%`
                                            : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                                          {voucher.maxDiscountAmount && voucher.discountType === "percentage"
                                            ? ` (tối đa ${voucher.maxDiscountAmount.toLocaleString("vi-VN")}đ)`
                                            : ""}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                          Đơn tối thiểu: {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                                        </p>
                                        {voucher.description && (
                                          <p className="text-gray-400 text-xs mt-1">{voucher.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    {!isEligible && (
                                      <p className="text-red-400 text-xs mt-2">
                                        Cần mua thêm {(voucher.minOrderValue - orderAmount).toLocaleString("vi-VN")}đ
                                      </p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm text-center py-4">Không có voucher khả dụng</p>
                          )}
                        </div>
                      )}

                      {/* Manual Voucher Input */}
                      <div className="flex">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Hoặc nhập mã giảm giá..."
                            value={voucherCode}
                            onChange={(e) => {
                              setVoucherCode(e.target.value)
                              setVoucherError("")
                            }}
                            className="pl-10 block w-full bg-slate-600/50 text-white border border-slate-500 rounded-l-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => handleApplyVoucher()}
                          disabled={isApplyingVoucher}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 py-2 px-4 rounded-r-xl transition-all duration-300 disabled:opacity-70 flex items-center font-medium"
                        >
                          {isApplyingVoucher ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                          ) : null}
                          Áp dụng
                        </button>
                      </div>
                      {voucherError && <p className="mt-1 text-sm text-red-400">{voucherError}</p>}
                    </div>

                    <div className="pt-3 flex justify-between">
                      <span className="text-lg font-medium text-white">Tổng cộng</span>
                      <span className="text-lg font-bold text-yellow-400">
                        {getFinalAmount().toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default PlaceOrder
