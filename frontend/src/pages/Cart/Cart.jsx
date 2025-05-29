"use client"
import { useContext, useState } from "react"
import { StoreContext } from "../../context/StoreContext"
import { useNavigate } from "react-router-dom"
import { Trash2, ShoppingBag, CreditCard, Plus, Minus, Tag, Check, X } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"

const Cart = () => {
  const { cartItems, food_list, removeFromCartAll, addToCart, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext)
  const navigate = useNavigate()
  const [voucherCode, setVoucherCode] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)

  // Check if cart is empty
  const isCartEmpty = Object.values(cartItems).every((quantity) => quantity === 0)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá")
      return
    }

    setIsApplyingVoucher(true)
    try {
      const response = await axios.post(`${url}/api/voucher/apply`, {
        code: voucherCode,
        orderAmount: getTotalCartAmount(),
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

  // Calculate final amount with discount
  const getFinalAmount = () => {
    const subtotal = getTotalCartAmount()
    const shippingFee = subtotal > 0 ? 14000 : 0

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
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-dark-lighter mt-20 mx-4 md:mx-auto max-w-6xl transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-6">Giỏ hàng của bạn</h1>

        {isCartEmpty ? (
          <div className="text-center py-12">
            <ShoppingBag size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-xl text-gray-500 dark:text-gray-400 mb-4">Giỏ hàng của bạn đang trống</h2>
            <button
              onClick={() => navigate("/foods")}
              className="bg-primary hover:bg-primary-light text-dark py-2 px-6 rounded-lg transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-lighter">
                <thead className="hidden sm:table-header-group">
                  <tr className="text-left border-b border-gray-200 dark:border-dark-lighter">
                    <th className="pb-4 text-dark dark:text-white font-medium">Sản phẩm</th>
                    <th className="pb-4 text-dark dark:text-white font-medium">Giá</th>
                    <th className="pb-4 text-dark dark:text-white font-medium">Số lượng</th>
                    <th className="pb-4 text-dark dark:text-white font-medium">Tổng tiền</th>
                    <th className="pb-4 text-dark dark:text-white font-medium">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {food_list.map((item, index) => {
                    if (cartItems[item.name] > 0) {
                      return (
                        <tr
                          key={index}
                          className="sm:border-b border-gray-200 dark:border-dark-lighter block sm:table-row mb-6 sm:mb-0"
                        >
                          <td className="py-4 flex items-center sm:table-cell">
                            <div className="flex items-center">
                              <img
                                src={url + "/images/" + item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg mr-4"
                              />
                              <div className="sm:hidden flex flex-col">
                                <span className="text-dark dark:text-white font-medium">{item.name}</span>
                                <span className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                  {item.price.toLocaleString("vi-VN")} đ
                                </span>
                              </div>
                              <span className="hidden sm:block text-dark dark:text-white">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                            {item.price.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-4 sm:table-cell block">
                            <div className="flex items-center justify-between sm:justify-start">
                              <span className="sm:hidden text-gray-600 dark:text-gray-400">Số lượng:</span>
                              <div className="flex items-center">
                                <button
                                  onClick={() => removeFromCart(item.name)}
                                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-light text-dark dark:text-white flex items-center justify-center hover:bg-primary transition-colors"
                                  aria-label="Giảm số lượng"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="mx-3 text-gray-600 dark:text-gray-300 min-w-[30px] text-center">
                                  {cartItems[item.name]}
                                </span>
                                <button
                                  onClick={() => addToCart(item.name, 1)}
                                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-light text-dark dark:text-white flex items-center justify-center hover:bg-primary transition-colors"
                                  aria-label="Tăng số lượng"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-dark dark:text-white font-medium sm:table-cell block">
                            <div className="flex justify-between sm:justify-start">
                              <span className="sm:hidden text-gray-600 dark:text-gray-400">Tổng:</span>
                              <span>{(item.price * cartItems[item.name]).toLocaleString("vi-VN")} đ</span>
                            </div>
                          </td>
                          <td className="py-4 sm:table-cell block text-right sm:text-left">
                            <button
                              onClick={() => removeFromCartAll(item.name)}
                              className="text-red-500 hover:text-red-400 transition-colors"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-dark-light p-6 rounded-xl border border-gray-200 dark:border-dark-lighter">
                <h3 className="text-lg font-medium text-dark dark:text-white mb-4">Mã giảm giá</h3>
                {appliedVoucher ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Check size={20} className="text-green-500 mr-2" />
                        <div>
                          <p className="text-green-700 dark:text-green-300 font-medium">{voucherCode}</p>
                          <p className="text-green-600 dark:text-green-400 text-sm">
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
                        className="text-red-500 hover:text-red-600 transition-colors"
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
                        className="pl-10 block w-full bg-white dark:bg-dark text-dark dark:text-white border border-gray-300 dark:border-dark-lighter rounded-l-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={handleApplyVoucher}
                      disabled={isApplyingVoucher}
                      className="bg-primary hover:bg-primary-light text-dark py-3 px-6 rounded-r-lg transition-colors disabled:opacity-70 flex items-center"
                    >
                      {isApplyingVoucher ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark mr-2"></div>
                      ) : null}
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-dark-light p-6 rounded-xl border border-gray-200 dark:border-dark-lighter">
                <h3 className="text-lg font-medium text-dark dark:text-white mb-4">Tổng giỏ hàng</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tạm tính</span>
                    <span className="text-dark dark:text-white">{getTotalCartAmount().toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Phí vận chuyển</span>
                    <span className="text-dark dark:text-white">
                      {(getTotalCartAmount() === 0 ? 0 : 14000).toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  {appliedVoucher && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Giảm giá</span>
                      <span>- {appliedVoucher.discountAmount.toLocaleString("vi-VN")} đ</span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 dark:border-dark-lighter pt-3 flex justify-between">
                    <span className="text-lg font-medium text-dark dark:text-white">Tổng cộng</span>
                    <span className="text-lg font-bold text-primary">{getFinalAmount().toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/order")}
                  className="mt-6 w-full bg-primary hover:bg-primary-light text-dark py-3 rounded-lg flex items-center justify-center transition-colors"
                >
                  <CreditCard size={20} className="mr-2" />
                  Tiến hành thanh toán
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

export default Cart
