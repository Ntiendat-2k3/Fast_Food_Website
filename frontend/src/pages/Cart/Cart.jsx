"use client"
import { useContext, useState, useEffect } from "react"
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { motion } from "framer-motion"

import CartHeader from "../../components/cart/CartHeader"
import CartTable from "../../components/cart/CartTable"
import CartSummary from "../../components/cart/CartSummary"
import VoucherSection from "../../components/voucher/VoucherSection"
import EmptyCartState from "../../components/cart/EmptyCartState"
import CartLoadingState from "../../components/cart/CartLoadingState"

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCartAll,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    isLoadingCart,
    loadCartData,
  } = useContext(StoreContext)

  const navigate = useNavigate()
  const [voucherCode, setVoucherCode] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [selectedItems, setSelectedItems] = useState({})
  const [selectAll, setSelectAll] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Debug cart items
  useEffect(() => {
    console.log("Cart items in Cart component:", cartItems)
  }, [cartItems])

  // Check if cart is empty
  const isCartEmpty = !cartItems || Object.keys(cartItems).length === 0

  // Manually refresh cart data
  const refreshCart = async () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để xem giỏ hàng")
      return
    }

    setIsRefreshing(true)
    try {
      await loadCartData(token)
      toast.success("Đã cập nhật giỏ hàng")
    } catch (error) {
      console.error("Error refreshing cart:", error)
      toast.error("Lỗi khi cập nhật giỏ hàng")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá")
      return
    }

    setIsApplyingVoucher(true)
    try {
      const response = await axios.post(`${url}/api/voucher/apply`, {
        code: voucherCode,
        orderAmount: getSelectedCartAmount(),
      })

      if (response.data.success) {
        setAppliedVoucher(response.data.data)
        toast.success("Áp dụng mã giảm giá thành công")
      } else {
        toast.error(response.data.message || "Mã giảm giá không hợp lệ")
      }
    } catch (error) {
      console.error("Error applying voucher:", error)
      toast.error("Đã xảy ra lỗi khi áp dụng mã giảm giá")
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode("")
    toast.info("Đã xóa mã giảm giá")
  }

  const getSelectedCartAmount = () => {
    let totalAmount = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0 && selectedItems[item]) {
        const itemInfo = food_list.find((product) => product.name === item)
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item]
        }
      }
    }
    return totalAmount
  }

  const handleSelectItem = (itemName) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }))
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    const newSelectedItems = {}
    if (cartItems) {
      Object.keys(cartItems).forEach((itemName) => {
        if (cartItems[itemName] > 0) {
          newSelectedItems[itemName] = newSelectAll
        }
      })
    }
    setSelectedItems(newSelectedItems)
  }

  const getSelectedItemsCount = () => {
    return Object.values(selectedItems).filter(Boolean).length
  }

  const hasSelectedItems = () => {
    return Object.values(selectedItems).some(Boolean)
  }

  // Initialize selected items when cart changes
  useEffect(() => {
    if (!cartItems) return

    // Initialize selected items for existing cart items
    const initialSelected = {}
    Object.keys(cartItems).forEach((itemName) => {
      if (cartItems[itemName] > 0) {
        initialSelected[itemName] = selectedItems[itemName] || false
      }
    })
    setSelectedItems(initialSelected)

    // Update select all state
    const cartItemsCount = Object.keys(cartItems).length
    const selectedCount = Object.values(initialSelected).filter(Boolean).length
    setSelectAll(cartItemsCount > 0 && selectedCount === cartItemsCount)
  }, [cartItems])

  // Calculate final amount with discount
  const getFinalAmount = () => {
    const subtotal = getSelectedCartAmount()
    const shippingFee = subtotal > 0 ? 14000 : 0

    if (!appliedVoucher || subtotal === 0) {
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

  const handleCheckout = () => {
    if (!hasSelectedItems()) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
      return
    }
    // Store selected items in localStorage for checkout page
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems))
    navigate("/order")
  }

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
          <CartHeader onRefresh={refreshCart} isRefreshing={isRefreshing} />

          <div className="p-6">
            {!token ? (
              <EmptyCartState
                title="Vui lòng đăng nhập để xem giỏ hàng"
                actionText="Đăng nhập"
                onAction={() => navigate("/login")}
              />
            ) : isLoadingCart ? (
              <CartLoadingState />
            ) : isCartEmpty ? (
              <EmptyCartState
                title="Giỏ hàng của bạn đang trống"
                actionText="Tiếp tục mua sắm"
                onAction={() => navigate("/foods")}
              />
            ) : (
              <>
                <CartTable
                  cartItems={cartItems}
                  food_list={food_list}
                  url={url}
                  selectedItems={selectedItems}
                  selectAll={selectAll}
                  onSelectAll={handleSelectAll}
                  onSelectItem={handleSelectItem}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                  onRemoveFromCartAll={removeFromCartAll}
                />

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <VoucherSection
                    voucherCode={voucherCode}
                    setVoucherCode={setVoucherCode}
                    appliedVoucher={appliedVoucher}
                    onApplyVoucher={handleApplyVoucher}
                    onRemoveVoucher={handleRemoveVoucher}
                    isApplying={isApplyingVoucher}
                  />

                  <CartSummary
                    selectedItemsCount={getSelectedItemsCount()}
                    selectedCartAmount={getSelectedCartAmount()}
                    appliedVoucher={appliedVoucher}
                    finalAmount={getFinalAmount()}
                    hasSelectedItems={hasSelectedItems()}
                    onCheckout={handleCheckout}
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Cart
