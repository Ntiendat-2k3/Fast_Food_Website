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
import { motion, AnimatePresence } from "framer-motion"

// Imported components
import AddressListSection from "../../components/address/AddressListSection"
import AddressForm from "../../components/address/AddressForm"
import AddressModal from "../../components/address/AddressModal"
import PaymentMethodSection from "../../components/payment/PaymentMethodSection"
import OrderSummary from "../../components/order/OrderSummary"
import VoucherList from "../../components/voucher/VoucherList"
import AnimatedBackground from "../../components/ui/AnimatedBackground"
import PageHeader from "../../components/ui/PageHeader"
import ConfirmButton from "../../components/ui/ConfirmButton"
import ShippingCalculator from "../../components/address/ShippingCalculator"

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems, userData } = useContext(StoreContext)
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

  // Address management
  const [savedAddresses, setSavedAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressFormMode, setAddressFormMode] = useState("add") // "add" or "edit"
  const [currentEditAddress, setCurrentEditAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)

  const [selectedCartItems, setSelectedCartItems] = useState({})
  const [shippingInfo, setShippingInfo] = useState(null)
  const [selectedAddressData, setSelectedAddressData] = useState(null)

  const navigate = useNavigate()

  // Khởi tạo selectedCartItems nếu đang ở chế độ buyNowMode
  useEffect(() => {
    if (buyNowMode && singleProduct) {
      // Không cần làm gì vì chúng ta sẽ sử dụng singleProduct
    } else {
      // Nếu không phải buyNowMode, kiểm tra localStorage
      const storedSelectedItems = localStorage.getItem("selectedCartItems")
      if (storedSelectedItems) {
        try {
          const parsedSelectedItems = JSON.parse(storedSelectedItems)
          setSelectedCartItems(parsedSelectedItems)
          console.log("Loaded selected items:", parsedSelectedItems)
        } catch (error) {
          console.error("Error parsing selected items:", error)

          // Nếu không có selectedCartItems, chọn tất cả các mục trong giỏ hàng
          const allSelected = {}
          for (const item in cartItems) {
            if (cartItems[item] > 0) {
              allSelected[item] = true
            }
          }
          setSelectedCartItems(allSelected)
          console.log("Created default selected items:", allSelected)
        }
      } else {
        // Nếu không có selectedCartItems, chọn tất cả các mục trong giỏ hàng
        const allSelected = {}
        for (const item in cartItems) {
          if (cartItems[item] > 0) {
            allSelected[item] = true
          }
        }
        setSelectedCartItems(allSelected)
        console.log("Created default selected items:", allSelected)
      }
    }
  }, [buyNowMode, singleProduct, cartItems])

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

    // If using saved address, no need to validate form
    if (selectedAddressId) {
      return true
    }

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

  // Tính tổng giá trị đơn hàng chính xác (chỉ sản phẩm đã chọn)
  const calculateOrderAmount = () => {
    if (buyNowMode && singleProduct) {
      return singleProduct.price * singleProduct.quantity
    }

    let totalAmount = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0 && selectedCartItems[item]) {
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
        console.log("Fetched vouchers:", response.data.data)
        setAvailableVouchers(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error)
    } finally {
      setLoadingVouchers(false)
    }
  }

  // Lấy danh sách địa chỉ đã lưu
  const fetchSavedAddresses = async () => {
    if (!token) return

    setLoadingAddresses(true)
    try {
      const response = await axios.get(`${url}/api/address/list`, {
        headers: { token },
      })

      if (response.data.success) {
        setSavedAddresses(response.data.data)

        // Nếu có địa chỉ mặc định, chọn nó
        const defaultAddress = response.data.data.find((addr) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id)
          // Cập nhật form data với địa chỉ mặc định
          setData({
            name: defaultAddress.name,
            street: defaultAddress.street,
            phone: defaultAddress.phone,
          })
        }
      } else {
        console.error("Failed to fetch addresses:", response.data.message)
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast.error("Không thể tải địa chỉ đã lưu")
    } finally {
      setLoadingAddresses(false)
    }
  }

  // Thêm địa chỉ mới
  const handleAddAddress = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin địa chỉ")
      return
    }

    try {
      const response = await axios.post(
        `${url}/api/address/add`,
        {
          name: data.name,
          street: data.street,
          phone: data.phone,
          isDefault: savedAddresses.length === 0, // Mặc định nếu là địa chỉ đầu tiên
        },
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        setSavedAddresses(response.data.data)
        setSelectedAddressId(response.data.data[0]._id) // Chọn địa chỉ vừa thêm
        setShowAddressForm(false)
        setShowAddressModal(false)
        toast.success("Thêm địa chỉ thành công")
      } else {
        toast.error(response.data.message || "Không thể thêm địa chỉ")
      }
    } catch (error) {
      console.error("Error adding address:", error)
      toast.error("Đã xảy ra lỗi khi thêm địa chỉ")
    }
  }

  // Cập nhật địa chỉ
  const handleUpdateAddress = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin địa chỉ")
      return
    }

    try {
      const response = await axios.put(
        `${url}/api/address/update`,
        {
          addressId: currentEditAddress._id,
          name: data.name,
          street: data.street,
          phone: data.phone,
          isDefault: currentEditAddress.isDefault,
        },
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        setSavedAddresses(response.data.data)
        setShowAddressForm(false)
        setShowAddressModal(false)
        toast.success("Cập nhật địa chỉ thành công")
      } else {
        toast.error(response.data.message || "Không thể cập nhật địa chỉ")
      }
    } catch (error) {
      console.error("Error updating address:", error)
      toast.error("Đã xảy ra lỗi khi cập nhật địa chỉ")
    }
  }

  // Xóa địa chỉ
  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axios.delete(`${url}/api/address/delete`, {
        headers: { token },
        data: { addressId },
      })

      if (response.data.success) {
        setSavedAddresses(response.data.data)

        // Nếu đang chọn địa chỉ bị xóa, reset selection
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null)
          // Nếu còn địa chỉ khác, chọn địa chỉ đầu tiên
          if (response.data.data.length > 0) {
            setSelectedAddressId(response.data.data[0]._id)
            setData({
              name: response.data.data[0].name,
              street: response.data.data[0].street,
              phone: response.data.data[0].phone,
            })
          } else {
            setData({ name: "", street: "", phone: "" })
          }
        }

        toast.success("Xóa địa chỉ thành công")
      } else {
        toast.error(response.data.message || "Không thể xóa địa chỉ")
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Đã xảy ra lỗi khi xóa địa chỉ")
    }
  }

  // Đặt địa chỉ mặc định
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axios.put(
        `${url}/api/address/set-default`,
        {
          addressId,
        },
        {
          headers: { token },
        },
      )

      if (response.data.success) {
        setSavedAddresses(response.data.data)
        toast.success("Đặt địa chỉ mặc định thành công")
      } else {
        toast.error(response.data.message || "Không thể đặt địa chỉ mặc định")
      }
    } catch (error) {
      console.error("Error setting default address:", error)
      toast.error("Đã xảy ra lỗi khi đặt địa chỉ mặc định")
    }
  }

  // Chọn địa chỉ
  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id)
    setData({
      name: address.name,
      street: address.street,
      phone: address.phone,
    })
  }

  // Mở form chỉnh sửa địa chỉ
  const handleEditAddress = (address) => {
    setAddressFormMode("edit")
    setCurrentEditAddress(address)
    setData({
      name: address.name,
      street: address.street,
      phone: address.phone,
    })
    setShowAddressForm(true)
    setShowAddressModal(true)
  }

  // Mở form thêm địa chỉ mới
  const handleAddNewAddress = () => {
    // Kiểm tra giới hạn địa chỉ
    if (savedAddresses.length >= 3) {
      toast.error("Bạn chỉ có thể lưu tối đa 3 địa chỉ. Vui lòng xóa địa chỉ cũ trước khi thêm mới.")
      return
    }

    setAddressFormMode("add")
    setCurrentEditAddress(null)
    setData({ name: "", street: "", phone: "" })
    setShowAddressForm(true)
    setShowAddressModal(true)
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
      console.log("Applying voucher with code:", code, "for order amount:", orderAmount)

      const response = await axios.post(`${url}/api/voucher/apply`, {
        code: code,
        orderAmount: orderAmount,
      })

      console.log("Voucher apply response:", response.data)

      if (response.data.success) {
        setCurrentAppliedVoucher(response.data.data)
        setVoucherCode(code)
        setShowVoucherList(false)
        toast.success("Áp dụng mã giảm giá thành công")
      } else {
        setVoucherError(response.data.message || "Mã giảm giá không hợp lệ")
        toast.error(response.data.message || "Mã giảm giá không hợp lệ")
      }
    } catch (error) {
      console.error("Error applying voucher:", error)
      setVoucherError("Đã xảy ra lỗi khi áp dụng mã giảm giá")
      toast.error("Đã xảy ra lỗi khi áp dụng mã giảm giá")
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
    console.log("Selected voucher:", voucher, "Order amount:", orderAmount)

    if (orderAmount < voucher.minOrderValue) {
      toast.error(`Giá trị đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString("vi-VN")}đ`)
      return
    }

    // Trực tiếp áp dụng voucher mà không cần gọi API
    const discountAmount = calculateDiscountAmount(voucher, orderAmount)

    setCurrentAppliedVoucher({
      voucherInfo: voucher,
      discountAmount: discountAmount,
    })

    setVoucherCode(voucher.code)
    setShowVoucherList(false)
    toast.success("Áp dụng mã giảm giá thành công")
  }

  // Tính toán số tiền giảm giá dựa trên voucher và giá trị đơn hàng
  const calculateDiscountAmount = (voucher, orderAmount) => {
    let discountAmount = 0

    if (voucher.discountType === "percentage") {
      discountAmount = (orderAmount * voucher.discountValue) / 100

      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount
      }
    } else {
      discountAmount = voucher.discountValue
    }

    return discountAmount
  }

  const handleShippingUpdate = (shipping) => {
    setShippingInfo(shipping)
  }

  const handleAddressSelect = (addressData) => {
    setSelectedAddressData(addressData)
    // Reset shipping info when address changes
    setShippingInfo(null)
  }

  // Sửa lại hàm placeOrder để khớp với yêu cầu của backend
  const placeOrder = async (event) => {
    event.preventDefault()

    // Nếu không chọn địa chỉ đã lưu, kiểm tra form
    if (!selectedAddressId && !validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin giao hàng")
      return
    }

    setIsSubmitting(true)

    // Kiểm tra xem có sản phẩm nào được chọn không
    if (!buyNowMode && Object.keys(selectedCartItems).length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
      setIsSubmitting(false)
      return
    }

    const hasSelectedItems = Object.values(selectedCartItems).some(Boolean)
    if (!buyNowMode && !hasSelectedItems) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
      setIsSubmitting(false)
      return
    }

    // Chuẩn bị danh sách sản phẩm
    const orderItems = []

    if (buyNowMode && singleProduct) {
      // Chỉ thêm sản phẩm được mua ngay
      orderItems.push({
        foodId: singleProduct._id,
        name: singleProduct.name,
        price: singleProduct.price,
        image: singleProduct.image,
        quantity: singleProduct.quantity,
      })
    } else {
      // Chỉ thêm sản phẩm đã được chọn trong giỏ hàng
      food_list.forEach((item) => {
        if (cartItems[item.name] > 0 && selectedCartItems[item.name]) {
          orderItems.push({
            foodId: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: cartItems[item.name],
          })
        }
      })
    }

    // Kiểm tra xem có sản phẩm nào không
    if (orderItems.length === 0) {
      toast.error("Không có sản phẩm nào để đặt hàng")
      setIsSubmitting(false)
      return
    }

    // Tính toán giá trị đơn hàng
    const subtotal = calculateOrderAmount()
    const shippingFee = shippingInfo?.shippingFee || 14000
    let discountAmount = 0

    if (currentAppliedVoucher) {
      discountAmount = currentAppliedVoucher.discountAmount || 0
    }

    const finalAmount = subtotal + shippingFee - discountAmount

    // Sử dụng địa chỉ đã chọn hoặc địa chỉ nhập mới
    const addressData = selectedAddressId ? savedAddresses.find((addr) => addr._id === selectedAddressId) : data

    // Chuẩn bị dữ liệu đơn hàng theo đúng định dạng API yêu cầu
    const orderData = {
      userId: userData?._id, // Đảm bảo có userId
      items: orderItems,
      amount: finalAmount,
      address: {
        name: addressData.name,
        street: addressData.street,
        phone: addressData.phone,
      },
      paymentMethod: paymentMethod,
      date: new Date(),
      voucherCode: currentAppliedVoucher?.voucherInfo?.code || null,
      discountAmount: discountAmount,
    }

    try {
      console.log("Placing order with data:", orderData)

      // Gửi yêu cầu đặt hàng
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: {
          token,
          "Content-Type": "application/json",
        },
      })

      console.log("Order response:", response.data)

      if (response.data.success) {
        // Xóa giỏ hàng nếu không phải chế độ mua ngay
        if (!buyNowMode) {
          // Chỉ xóa các mục đã được chọn
          const newCartItems = { ...cartItems }
          for (const item in selectedCartItems) {
            if (selectedCartItems[item]) {
              delete newCartItems[item]
            }
          }
          setCartItems(newCartItems)
          localStorage.removeItem("selectedCartItems")
        }

        // Chuyển hướng dựa trên phương thức thanh toán
        if (paymentMethod === "COD") {
          navigate("/thankyou", { state: { orderId: response.data.orderId } })
        } else {
          navigate(`/payment/${paymentMethod}/${response.data.orderId}`)
        }
      } else {
        toast.error(response.data.message || "Đã xảy ra lỗi khi đặt hàng")
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error)

      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        console.error("Error response data:", error.response.data)
        console.error("Error response status:", error.response.status)
        toast.error(error.response.data?.message || "Lỗi từ máy chủ khi đặt hàng")
      } else if (error.request) {
        console.error("Error request:", error.request)
        toast.error("Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.")
      } else {
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/cart")
    } else if (!buyNowMode && getTotalCartAmount() === 0) {
      navigate("/cart")
    }
  }, [token, buyNowMode])

  useEffect(() => {
    fetchAvailableVouchers()
    fetchSavedAddresses()
  }, [token])

  const getFinalAmount = () => {
    const subtotal = calculateOrderAmount()
    const shippingFee = shippingInfo?.shippingFee || 14000 // Default 14k nếu chưa tính

    if (!currentAppliedVoucher) {
      return subtotal + shippingFee
    }

    let discountAmount = 0
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
    <AnimatedBackground>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
      >
        <PageHeader icon={<Sparkles size={24} />} title="Thanh toán" />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <ShieldCheck className="mr-2 text-yellow-400" size={20} />
                Thông tin vận chuyển
              </h2>

              {/* Saved Addresses Section */}
              <AddressListSection
                addresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectAddress}
                onAddNewAddress={handleAddNewAddress}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
                isLoading={loadingAddresses}
              />

              {/* Shipping Calculator */}
              {(selectedAddressId || selectedAddressData) && (
                <ShippingCalculator
                  selectedAddress={
                    selectedAddressId
                      ? savedAddresses.find((addr) => addr._id === selectedAddressId)?.street
                      : data.street
                  }
                  onShippingUpdate={handleShippingUpdate}
                />
              )}

              {/* New Address Form */}
              {(!savedAddresses.length || !selectedAddressId) && (
                <>
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

                  <AddressForm
                    data={data}
                    errors={errors}
                    onChangeHandler={onChangeHandler}
                    onSubmit={placeOrder}
                    onAddressSelect={handleAddressSelect}
                  />
                </>
              )}

              <PaymentMethodSection
                methods={paymentMethods}
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
              />

              <ConfirmButton
                icon={<CreditCard size={20} />}
                text="Xác nhận đặt hàng"
                loading={isSubmitting}
                onClick={placeOrder}
                className="mt-6"
              />
            </div>

            <OrderSummary
              items={buyNowMode ? [singleProduct] : food_list}
              cartItems={cartItems}
              selectedCartItems={selectedCartItems}
              buyNowMode={buyNowMode}
              singleProduct={singleProduct}
              food_list={food_list}
              url={url}
              calculateOrderAmount={calculateOrderAmount}
              currentAppliedVoucher={currentAppliedVoucher}
              getFinalAmount={getFinalAmount}
            >
              {/* Voucher Section */}
              <div className="border-t border-slate-600 pt-3 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">Mã giảm giá</label>
                  <button
                    onClick={() => setShowVoucherList(!showVoucherList)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center"
                  >
                    <Gift size={16} className="mr-1" />
                    {showVoucherList ? "Ẩn voucher" : "Chọn voucher"}
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
                          <p className="text-green-300 font-medium text-sm">{currentAppliedVoucher.voucherInfo.code}</p>
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
                <AnimatePresence>
                  {showVoucherList && (
                    <VoucherList
                      vouchers={availableVouchers}
                      currentVoucher={currentAppliedVoucher?.voucherInfo}
                      orderAmount={calculateOrderAmount()}
                      onSelectVoucher={handleSelectVoucher}
                      isLoading={loadingVouchers}
                    />
                  )}
                </AnimatePresence>

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
            </OrderSummary>
          </div>
        </div>
      </motion.div>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            isOpen={showAddressModal}
            onClose={() => setShowAddressModal(false)}
            formMode={addressFormMode}
            formData={data}
            formErrors={errors}
            onChangeHandler={onChangeHandler}
            onSubmit={addressFormMode === "add" ? handleAddAddress : handleUpdateAddress}
          />
        )}
      </AnimatePresence>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AnimatedBackground>
  )
}

export default PlaceOrder
