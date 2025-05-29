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
} from "lucide-react"

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems } = useContext(StoreContext)
  const location = useLocation()
  const appliedVoucher = location.state?.appliedVoucher || null

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
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [voucherError, setVoucherError] = useState("")

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

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã giảm giá")
      return
    }

    setIsApplyingVoucher(true)
    setVoucherError("")

    try {
      const response = await axios.post(`${url}/api/voucher/apply`, {
        code: voucherCode,
        orderAmount: getTotalCartAmount(),
      })

      if (response.data.success) {
        navigate("/order", {
          state: {
            appliedVoucher: response.data.data,
          },
        })
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

  const placeOrder = async (event) => {
    event.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin giao hàng")
      return
    }

    setIsSubmitting(true)

    const orderItems = []
    food_list.map((item) => {
      if (cartItems[item.name] > 0) {
        const itemInfo = { ...item }
        itemInfo["quantity"] = cartItems[item.name]
        orderItems.push(itemInfo)
      }
    })

    // Calculate final amount with discount
    const subtotal = getTotalCartAmount()
    const shippingFee = 14000
    let discountAmount = 0

    if (appliedVoucher) {
      if (appliedVoucher.voucherInfo.discountType === "percentage") {
        discountAmount = (subtotal * appliedVoucher.voucherInfo.discountValue) / 100

        // Apply max discount if set
        if (
          appliedVoucher.voucherInfo.maxDiscountAmount &&
          discountAmount > appliedVoucher.voucherInfo.maxDiscountAmount
        ) {
          discountAmount = appliedVoucher.voucherInfo.maxDiscountAmount
        }
      } else {
        discountAmount = appliedVoucher.voucherInfo.discountValue
      }
    }

    const finalAmount = subtotal + shippingFee - discountAmount

    const orderData = {
      address: data,
      items: orderItems,
      amount: finalAmount,
      paymentMethod: paymentMethod,
      voucherId: appliedVoucher?.voucherInfo?._id || null,
      discountAmount: discountAmount,
    }

    try {
      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      })

      if (response.data.success) {
        // Xóa giỏ hàng sau khi đặt hàng thành công
        setCartItems({})

        console.log("Order placed successfully:", response.data)
        console.log(
          "Redirecting to:",
          paymentMethod === "COD" ? "/thankyou" : `/payment/${paymentMethod}/${response.data.orderId}`,
        )

        // Chuyển hướng dựa trên phương thức thanh toán
        if (paymentMethod === "COD") {
          navigate("/thankyou")
        } else {
          // Chuyển hướng đến trang thanh toán
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
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart")
    }
  }, [token])

  // Calculate final amount with discount
  const getFinalAmount = () => {
    const subtotal = getTotalCartAmount()
    const shippingFee = 14000

    if (!appliedVoucher) {
      return subtotal + shippingFee
    }

    let discountAmount = 0
    if (appliedVoucher.voucherInfo.discountType === "percentage") {
      discountAmount = (subtotal * appliedVoucher.voucherInfo.discountValue) / 100

      // Apply max discount if set
      if (
        appliedVoucher.voucherInfo.maxDiscountAmount &&
        discountAmount > appliedVoucher.voucherInfo.maxDiscountAmount
      ) {
        discountAmount = appliedVoucher.voucherInfo.maxDiscountAmount
      }
    } else {
      discountAmount = appliedVoucher.voucherInfo.discountValue
    }

    return subtotal + shippingFee - discountAmount
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden mt-20 mx-4 md:mx-auto max-w-6xl transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">Thông tin vận chuyển</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Vui lòng nhập đầy đủ thông tin giao hàng để đảm bảo đơn hàng được giao đến đúng địa chỉ.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={placeOrder} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  className={`w-full bg-white dark:bg-dark-light text-dark dark:text-white border ${
                    errors.name ? "border-red-500" : "border-gray-300 dark:border-dark-lighter"
                  } rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                  required
                  name="name"
                  onChange={onChangeHandler}
                  value={data.name}
                  type="text"
                  placeholder="Họ tên người nhận"
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  className={`w-full bg-white dark:bg-dark-light text-dark dark:text-white border ${
                    errors.street ? "border-red-500" : "border-gray-300 dark:border-dark-lighter"
                  } rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]`}
                  required
                  name="street"
                  onChange={onChangeHandler}
                  value={data.street}
                  placeholder="Địa chỉ giao hàng chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                />
                {errors.street && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.street}
                  </div>
                )}
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  className={`w-full bg-white dark:bg-dark-light text-dark dark:text-white border ${
                    errors.phone ? "border-red-500" : "border-gray-300 dark:border-dark-lighter"
                  } rounded-lg py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary`}
                  required
                  name="phone"
                  onChange={onChangeHandler}
                  value={data.phone}
                  type="text"
                  placeholder="Số điện thoại liên hệ (VD: 0912345678)"
                />
                {errors.phone && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-dark dark:text-white mb-4">Phương thức thanh toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`border ${
                      paymentMethod === "COD"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 dark:border-dark-lighter"
                    } rounded-lg p-4 cursor-pointer hover:border-primary transition-colors`}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "COD" ? "border-primary" : "border-gray-400"
                        } flex items-center justify-center mr-3`}
                      >
                        {paymentMethod === "COD" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <div className="flex items-center">
                        <Truck size={20} className="mr-2 text-gray-600 dark:text-gray-300" />
                        <span className="text-dark dark:text-white">Thanh toán khi nhận hàng (COD)</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border ${
                      paymentMethod === "VNPay"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 dark:border-dark-lighter"
                    } rounded-lg p-4 cursor-pointer hover:border-primary transition-colors`}
                    onClick={() => setPaymentMethod("VNPay")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "VNPay" ? "border-primary" : "border-gray-400"
                        } flex items-center justify-center mr-3`}
                      >
                        {paymentMethod === "VNPay" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <div className="flex items-center">
                        <CardIcon size={20} className="mr-2 text-gray-600 dark:text-gray-300" />
                        <span className="text-dark dark:text-white">VNPay</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border ${
                      paymentMethod === "MoMo"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 dark:border-dark-lighter"
                    } rounded-lg p-4 cursor-pointer hover:border-primary transition-colors`}
                    onClick={() => setPaymentMethod("MoMo")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "MoMo" ? "border-primary" : "border-gray-400"
                        } flex items-center justify-center mr-3`}
                      >
                        {paymentMethod === "MoMo" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <div className="flex items-center">
                        <Wallet size={20} className="mr-2 text-gray-600 dark:text-gray-300" />
                        <span className="text-dark dark:text-white">Ví MoMo</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border ${
                      paymentMethod === "BankTransfer"
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 dark:border-dark-lighter"
                    } rounded-lg p-4 cursor-pointer hover:border-primary transition-colors`}
                    onClick={() => setPaymentMethod("BankTransfer")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          paymentMethod === "BankTransfer" ? "border-primary" : "border-gray-400"
                        } flex items-center justify-center mr-3`}
                      >
                        {paymentMethod === "BankTransfer" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <div className="flex items-center">
                        <Landmark size={20} className="mr-2 text-gray-600 dark:text-gray-300" />
                        <span className="text-dark dark:text-white">Chuyển khoản ngân hàng</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-light text-dark py-3 rounded-lg flex items-center justify-center transition-colors mt-6 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark mr-3"></div>
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
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">Đơn hàng của bạn</h2>
            <div className="bg-gray-50 dark:bg-dark-light rounded-xl p-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {food_list.map((item, index) => {
                  if (cartItems[item.name] > 0) {
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={url + "/images/" + item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                          />
                          <div>
                            <p className="text-dark dark:text-white">{item.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {item.price.toLocaleString("vi-VN")} đ x {cartItems[item.name]}
                            </p>
                          </div>
                        </div>
                        <p className="text-dark dark:text-white font-medium">
                          {(item.price * cartItems[item.name]).toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    )
                  }
                  return null
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-300 dark:border-dark-lighter space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tạm tính</span>
                  <span className="text-dark dark:text-white">{getTotalCartAmount().toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Phí vận chuyển</span>
                  <span className="text-dark dark:text-white">14.000 đ</span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <div className="flex items-center">
                      <Tag size={16} className="mr-2" />
                      <span>Giảm giá ({appliedVoucher.voucherInfo.code})</span>
                    </div>
                    <span>- {appliedVoucher.discountAmount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}

                <div className="border-t border-gray-300 dark:border-dark-lighter pt-3 mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mã giảm giá (nếu có)
                  </label>
                  <div className="flex">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá..."
                        value={voucherCode}
                        onChange={(e) => {
                          setVoucherCode(e.target.value)
                          setVoucherError("")
                        }}
                        className="pl-10 block w-full bg-white dark:bg-dark text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={handleApplyVoucher}
                      disabled={isApplyingVoucher}
                      className="bg-primary hover:bg-primary-light text-dark py-2 px-4 rounded-r-lg transition-colors disabled:opacity-70 flex items-center"
                    >
                      {isApplyingVoucher ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark mr-2"></div>
                      ) : null}
                      Áp dụng
                    </button>
                  </div>
                  {voucherError && <p className="mt-1 text-sm text-red-500">{voucherError}</p>}
                </div>

                <div className="pt-3 flex justify-between">
                  <span className="text-lg font-medium text-dark dark:text-white">Tổng cộng</span>
                  <span className="text-lg font-bold text-primary">{getFinalAmount().toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default PlaceOrder
