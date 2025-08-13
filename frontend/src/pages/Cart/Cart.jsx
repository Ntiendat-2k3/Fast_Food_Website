"use client"
import { useContext, useState, useEffect } from "react"
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion } from "framer-motion"

import CartHeader from "../../components/cart/CartHeader"
import CartTable from "../../components/cart/CartTable"
import CartSummary from "../../components/cart/CartSummary"
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

  const getSelectedCartAmount = () => {
    let totalAmount = 0
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0 && selectedItems[itemId]) {
        const itemInfo = food_list.find((product) => product._id === itemId)
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId]
        }
      }
    }
    return totalAmount
  }

  const handleSelectItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    const newSelectedItems = {}
    if (cartItems) {
      Object.keys(cartItems).forEach((itemId) => {
        if (cartItems[itemId] > 0) {
          newSelectedItems[itemId] = newSelectAll
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
    Object.keys(cartItems).forEach((itemId) => {
      if (cartItems[itemId] > 0) {
        initialSelected[itemId] = selectedItems[itemId] || false
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-16 sm:pt-20 pb-8 sm:pb-16">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 sm:w-80 sm:h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
        >
          <CartHeader onRefresh={refreshCart} isRefreshing={isRefreshing} />

          <div className="p-4 sm:p-6">
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
              <div className="space-y-6 sm:space-y-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">{/* Voucher section could go here */}</div>
                  <div className="lg:col-span-1">
                    <CartSummary
                      selectedItemsCount={getSelectedItemsCount()}
                      selectedCartAmount={getSelectedCartAmount()}
                      appliedVoucher={appliedVoucher}
                      finalAmount={getFinalAmount()}
                      hasSelectedItems={hasSelectedItems()}
                      onCheckout={handleCheckout}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="text-sm"
      />
    </div>
  )
}

export default Cart
