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
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Imported components
import AddressListSection from "../../components/address/AddressListSection"
import AddressModal from "../../components/address/AddressModal"
import OrderSummaryNew from "../../components/order/OrderSummaryNew"
import VoucherList from "../../components/voucher/VoucherList"
import AnimatedBackground from "../../components/ui/AnimatedBackground"
import PageHeader from "../../components/ui/PageHeader"
import ConfirmButton from "../../components/ui/ConfirmButton"
import ShippingCalculator from "../../components/address/ShippingCalculator"

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems, user } = useContext(StoreContext)
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
          for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
              allSelected[itemId] = true
            }
          }
          setSelectedCartItems(allSelected)
          console.log("Created default selected items:", allSelected)
        }
      } else {
        // Nếu không có selectedCartItems, chọn tất cả các mục trong giỏ hàng
        const allSelected = {}
        for (const itemId in cartItems) {
          if (cartItems[itemId] > 0) {
            allSelected[itemId] = true
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
      newErrors.street = "Địa ch��� phải đầy đủ và chi tiết (ít nhất 10 ký tự)"
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
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0 && selectedCartItems[itemId]) {
        const itemInfo = food_list.find((product) => product._id === itemId)
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId]
        }
      }
    }
    return totalAmount
  }

  // Lấy danh sách sản phẩm để hiển thị
  const getOrderItems = () => {
    if (buyNowMode && singleProduct) {
      return [singleProduct]
    }

    const items = food_list
      .filter((item) => cartItems[item._id] > 0 && selectedCartItems[item._id])
      .map((item) => ({
        ...item,
        quantity: cartItems[item._id],
      }))

    console.log("Order items:", items)
    return items
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

  // Get selected address for shipping calculator
  const getSelectedAddressForShipping = () => {
    if (selectedAddressId) {
      const selectedAddress = savedAddresses.find((addr) => addr._id === selectedAddressId)
      return selectedAddress?.street || ""
    }
    return data.street || ""
  }

  // Sửa lại hàm placeOrder để khớp với yêu cầu của backend
  const placeOrder = async (event) => {
    event.preventDefault()

    // Nếu không chọn địa chỉ đã lưu, kiểm tra form
    if (!selectedAddressId && !validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin giao hàng")
      return
    }

    // Kiểm tra phí ship đã được tính chưa
    if (!shippingInfo) {
      toast.error("Vui lòng tính phí vận chuyển trước khi đặt hàng")
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
        if (cartItems[item._id] > 0 && selectedCartItems[item._id]) {
          orderItems.push({
            foodId: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: cartItems[item._id],
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
    const shippingFee = shippingInfo.shippingFee || 0
    let discountAmount = 0

    if (currentAppliedVoucher) {
      discountAmount = currentAppliedVoucher.discountAmount || 0
    }

    const finalAmount = subtotal + shippingFee - discountAmount

    // Sử dụng địa chỉ đã chọn hoặc địa chỉ nhập mới
    const addressData = selectedAddressId ? savedAddresses.find((addr) => addr._id === selectedAddressId) : data

    // Chuẩn bị dữ liệu đơn hàng theo đúng định dạng API yêu cầu
    const orderData = {
      userId: user?._id, // Đảm bảo có userId
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
      shippingFee: shippingFee,
      shippingInfo: {
        distance: shippingInfo.distance,
        duration: shippingInfo.duration,
        estimatedDelivery: shippingInfo.duration,
      },
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
          for (const itemId in selectedCartItems) {
            if (selectedCartItems[itemId]) {
              delete newCartItems[itemId]
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
    const shippingFee = shippingInfo?.shippingFee || 0

    if (!currentAppliedVoucher) {
      return subtotal + shippingFee
    }

    let discountAmount = 0
    if (currentAppliedVoucher.voucherInfo?.discountType === "percentage") {
      discountAmount = (subtotal * currentAppliedVoucher.voucherInfo.discountValue) / 100

      if (
        currentAppliedVoucher.voucherInfo.maxDiscountAmount &&
        discountAmount > currentAppliedVoucher.voucherInfo.maxDiscountAmount
      ) {
        discountAmount = currentAppliedVoucher.voucherInfo.maxDiscountAmount
      }
    } else if (currentAppliedVoucher.voucherInfo) {
      discountAmount = currentAppliedVoucher.voucherInfo.discountValue
    } else {
      discountAmount = currentAppliedVoucher.discountAmount || 0
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

  // Tính toán các giá trị để truyền vào OrderSummaryNew
  const orderItems = getOrderItems()
  const subtotalAmount = calculateOrderAmount()
  const shippingFeeAmount = shippingInfo?.shippingFee || 0
  const discountAmount = currentAppliedVoucher?.discountAmount || 0
  const totalAmount = getFinalAmount()

  console.log("PlaceOrder calculated values:", {
    orderItems,
    subtotalAmount,
    shippingFeeAmount,
    discountAmount,
    totalAmount,
  })

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

              {/* Shipping Calculator - Auto calculate when address is selected */}
              <ShippingCalculator
                selectedAddress={getSelectedAddressForShipping()}
                onShippingCalculated={handleShippingUpdate}
                className="mt-6"
              />

              {/* Manual Address Form (if no saved address selected) */}
              {!selectedAddressId && (
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Nhập địa chỉ mới</h3>
                  <div className="space-y-4">
                    <div>
                      <input
                        name="name"
                        onChange={onChangeHandler}
                        value={data.name}
                        type="text"
                        placeholder="Họ và tên người nhận"
                        className={`w-full p-3 bg-slate-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                          errors.name ? "border-red-500" : "border-slate-600"
                        }`}
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <input
                        name="phone"
                        onChange={onChangeHandler}
                        value={data.phone}
                        type="tel"
                        placeholder="Số điện thoại (VD: 0912345678)"
                        className={`w-full p-3 bg-slate-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                          errors.phone ? "border-red-500" : "border-slate-600"
                        }`}
                      />
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Section */}
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CreditCard className="mr-2 text-yellow-400" size={20} />
                  Phương thức thanh toán
                </h3>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-yellow-400 bg-yellow-400/10"
                          : "border-slate-600 bg-slate-800/30 hover:bg-slate-700/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center flex-1">
                        {method.icon}
                        <div className="ml-3">
                          <div className="text-white font-medium">{method.name}</div>
                          <div className="text-gray-400 text-sm">{method.description}</div>
                        </div>
                      </div>
                      {paymentMethod === method.id && <Check className="text-yellow-400" size={20} />}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Gift className="mr-2 text-yellow-400" size={20} />
                Chi tiết đơn hàng
              </h2>

              {/* Voucher Section */}
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Tag className="mr-2 text-yellow-400" size={20} />
                    Mã giảm giá
                  </h3>
                  <button
                    onClick={() => setShowVoucherList(!showVoucherList)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center"
                  >
                    Chọn voucher
                    {showVoucherList ? (
                      <ChevronUp className="ml-1" size={16} />
                    ) : (
                      <ChevronDown className="ml-1" size={16} />
                    )}
                  </button>
                </div>

                {/* Applied Voucher Display */}
                {currentAppliedVoucher && (
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-yellow-300 font-semibold">
                          {currentAppliedVoucher.voucherInfo?.code || "Voucher"}
                        </div>
                        <div className="text-yellow-200 text-sm">
                          Giảm {(currentAppliedVoucher.discountAmount || 0).toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                      <button onClick={handleRemoveVoucher} className="text-red-400 hover:text-red-300 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Voucher Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    onClick={() => handleApplyVoucher()}
                    disabled={isApplyingVoucher || !voucherCode.trim()}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                  </button>
                </div>

                {voucherError && (
                  <div className="text-red-400 text-sm mb-4 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    {voucherError}
                  </div>
                )}

                {/* Voucher List */}
                <AnimatePresence>
                  {showVoucherList && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VoucherList
                        vouchers={availableVouchers}
                        onSelectVoucher={handleSelectVoucher}
                        orderAmount={calculateOrderAmount()}
                        isLoading={loadingVouchers}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Order Summary - Using the new component */}
              <OrderSummaryNew
                items={orderItems}
                subtotal={subtotalAmount}
                shippingFee={shippingFeeAmount}
                discount={discountAmount}
                total={totalAmount}
                appliedVoucher={currentAppliedVoucher}
                shippingInfo={shippingInfo}
              />

              {/* Place Order Button */}
              <ConfirmButton
                onClick={placeOrder}
                disabled={isSubmitting || !shippingInfo}
                isLoading={isSubmitting}
                loadingText="Đang xử lý đơn hàng..."
                className="w-full mt-6"
              >
                <div className="flex items-center justify-center">
                  <Sparkles className="mr-2" size={20} />
                  Đặt hàng - {totalAmount.toLocaleString("vi-VN")}đ
                </div>
              </ConfirmButton>

              {!shippingInfo && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mt-4">
                  <div className="flex items-center">
                    <Info className="text-blue-400 mr-2" size={16} />
                    <span className="text-blue-300 text-sm">Vui lòng chọn địa chỉ để tự động tính phí vận chuyển</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false)
          setShowAddressForm(false)
        }}
        formMode={addressFormMode}
        formData={data}
        formErrors={errors}
        onChangeHandler={onChangeHandler}
        onSubmit={addressFormMode === "add" ? handleAddAddress : handleUpdateAddress}
      />

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
