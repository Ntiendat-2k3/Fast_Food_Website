"use client"
import { useContext, useState, useEffect } from "react"
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { Trash2, ShoppingBag, CreditCard, Plus, Minus, Tag, Check, X, Sparkles, RefreshCw } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { motion } from "framer-motion"

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

  // Render cart items
  const renderCartItems = () => {
    if (!cartItems || Object.keys(cartItems).length === 0) {
      return null
    }

    return Object.keys(cartItems).map((itemName, index) => {
      if (cartItems[itemName] <= 0) return null

      const item = food_list.find((product) => product.name === itemName)
      if (!item) {
        console.log(`Item not found in food_list: ${itemName}`)
        return null
      }

      return (
        <motion.tr
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="sm:border-b border-slate-700 block sm:table-row mb-6 sm:mb-0"
        >
          <td className="py-4 sm:table-cell block">
            <div className="flex items-center justify-center sm:justify-start">
              <input
                type="checkbox"
                checked={selectedItems[itemName] || false}
                onChange={() => handleSelectItem(itemName)}
                className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
              />
            </div>
          </td>
          <td className="py-4 flex items-center sm:table-cell">
            <div className="flex items-center">
              <div className="relative">
                <img
                  src={url + "/images/" + item.image || "/placeholder.svg"}
                  alt={itemName}
                  className="w-16 h-16 object-cover rounded-xl mr-4 border border-slate-600"
                />
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems[itemName]}
                </div>
              </div>
              <div className="sm:hidden flex flex-col">
                <span className="text-white font-medium">{itemName}</span>
                <span className="text-gray-300 text-sm mt-1">{item.price.toLocaleString("vi-VN")} đ</span>
              </div>
              <span className="hidden sm:block text-white">{itemName}</span>
            </div>
          </td>
          <td className="py-4 text-gray-300 hidden sm:table-cell">{item.price.toLocaleString("vi-VN")} đ</td>
          <td className="py-4 sm:table-cell block">
            <div className="flex items-center justify-between sm:justify-start">
              <span className="sm:hidden text-gray-400">Số lượng:</span>
              <div className="flex items-center bg-slate-700/50 rounded-xl p-1">
                <button
                  onClick={() => removeFromCart(itemName)}
                  className="w-8 h-8 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={16} />
                </button>
                <span className="mx-3 text-white min-w-[30px] text-center font-medium">{cartItems[itemName]}</span>
                <button
                  onClick={() => addToCart(itemName, 1)}
                  className="w-8 h-8 rounded-lg bg-slate-600 hover:bg-yellow-400 hover:text-slate-900 text-white flex items-center justify-center transition-all duration-200"
                  aria-label="Tăng số lượng"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </td>
          <td className="py-4 text-white font-medium sm:table-cell block">
            <div className="flex justify-between sm:justify-start">
              <span className="sm:hidden text-gray-400">Tổng:</span>
              <span className="text-yellow-400 font-bold">
                {(item.price * cartItems[itemName]).toLocaleString("vi-VN")} đ
              </span>
            </div>
          </td>
          <td className="py-4 sm:table-cell block text-right sm:text-left">
            <button
              onClick={() => removeFromCartAll(itemName)}
              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              aria-label="Xóa sản phẩm"
            >
              <Trash2 size={20} />
            </button>
          </td>
        </motion.tr>
      )
    })
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
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-700/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="text-yellow-400 mr-3" size={24} />
                <h1 className="text-2xl font-bold text-white">Giỏ hàng của bạn</h1>
              </div>
              <button
                onClick={refreshCart}
                disabled={isRefreshing}
                className="flex items-center text-gray-300 hover:text-yellow-400 transition-colors"
              >
                <RefreshCw size={18} className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Cập nhật</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {!token ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl text-gray-300 mb-4">Vui lòng đăng nhập để xem giỏ hàng</h2>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
                >
                  Đăng nhập
                </button>
              </motion.div>
            ) : isLoadingCart ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
                <p className="text-gray-300">Đang tải giỏ hàng...</p>
              </div>
            ) : isCartEmpty ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={48} className="text-gray-400" />
                </div>
                <h2 className="text-xl text-gray-300 mb-4">Giỏ hàng của bạn đang trống</h2>
                <button
                  onClick={() => navigate("/foods")}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-3 px-8 rounded-xl transition-all duration-300 font-medium hover:scale-105"
                >
                  Tiếp tục mua sắm
                </button>
              </motion.div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="min-w-full">
                    <thead className="hidden sm:table-header-group">
                      <tr className="text-left border-b border-slate-700">
                        <th className="pb-4 text-white font-medium w-12">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="w-4 h-4 text-yellow-400 bg-slate-600 border-slate-500 rounded focus:ring-yellow-400 focus:ring-2"
                            />
                          </div>
                        </th>
                        <th className="pb-4 text-white font-medium">Sản phẩm</th>
                        <th className="pb-4 text-white font-medium">Giá</th>
                        <th className="pb-4 text-white font-medium">Số lượng</th>
                        <th className="pb-4 text-white font-medium">Tổng tiền</th>
                        <th className="pb-4 text-white font-medium">Xóa</th>
                      </tr>
                    </thead>
                    <tbody>{renderCartItems()}</tbody>
                  </table>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600"
                  >
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <Tag className="mr-2 text-yellow-400" size={20} />
                      Mã giảm giá
                    </h3>
                    {appliedVoucher ? (
                      <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Check size={20} className="text-green-400 mr-2" />
                            <div>
                              <p className="text-green-300 font-medium">{voucherCode}</p>
                              <p className="text-green-400 text-sm">
                                {appliedVoucher.voucherInfo.discountType === "percentage"
                                  ? `Giảm ${appliedVoucher.voucherInfo.discountValue}%`
                                  : `Giảm ${appliedVoucher.voucherInfo.discountValue.toLocaleString("vi-VN")}đ`}
                                {appliedVoucher.voucherInfo.maxDiscountAmount
                                  ? ` (tối đa ${appliedVoucher.voucherInfo.maxDiscountAmount.toLocaleString("vi-VN")}đ)`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveVoucher}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Nhập mã giảm giá..."
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            className="pl-10 block w-full bg-slate-600/50 text-white border border-slate-500 rounded-l-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={handleApplyVoucher}
                          disabled={isApplyingVoucher}
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 py-3 px-6 rounded-r-xl transition-all duration-300 disabled:opacity-70 flex items-center font-medium"
                        >
                          {isApplyingVoucher ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                          ) : null}
                          Áp dụng
                        </button>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-slate-700/30 backdrop-blur-sm p-6 rounded-xl border border-slate-600"
                  >
                    <h3 className="text-lg font-medium text-white mb-4">Tổng giỏ hàng</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sản phẩm đã chọn ({getSelectedItemsCount()})</span>
                        <span className="text-white">{getSelectedCartAmount().toLocaleString("vi-VN")} đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Phí vận chuyển</span>
                        <span className="text-white">
                          {(getSelectedCartAmount() === 0 ? 0 : 14000).toLocaleString("vi-VN")} đ
                        </span>
                      </div>

                      {appliedVoucher && getSelectedCartAmount() > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Giảm giá</span>
                          <span>- {appliedVoucher.discountAmount.toLocaleString("vi-VN")} đ</span>
                        </div>
                      )}

                      <div className="border-t border-slate-600 pt-3 flex justify-between">
                        <span className="text-lg font-medium text-white">Tổng cộng</span>
                        <span className="text-lg font-bold text-yellow-400">
                          {getFinalAmount().toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!hasSelectedItems()) {
                          toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán")
                          return
                        }
                        // Store selected items in localStorage for checkout page
                        localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems))
                        navigate("/order")
                      }}
                      disabled={!hasSelectedItems()}
                      className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center transition-all duration-300 font-medium ${
                        hasSelectedItems()
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 hover:scale-105"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <CreditCard size={20} className="mr-2" />
                      Tiến hành thanh toán ({getSelectedItemsCount()} sản phẩm)
                    </button>
                  </motion.div>
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
