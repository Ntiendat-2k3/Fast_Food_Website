"use client"

import { useState, useEffect, useContext } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Star, AlertCircle, RefreshCw } from "lucide-react"
import ReviewsList from "./ReviewsList"
import ReviewCommentForm from "../../components/ReviewCommentForm"
import { StoreContext } from "../../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

const ReviewsTab = ({ foodItem, ratingStats, isLoadingStats, reviews, isLoadingReviews, token, user, url }) => {
  const { url: contextUrl } = useContext(StoreContext)
  const [showForm, setShowForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [userEligibility, setUserEligibility] = useState(null)
  const [isCheckingUserEligibility, setIsCheckingUserEligibility] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  // Check user eligibility when component mounts or user changes
  useEffect(() => {
    if (token && user && foodItem) {
      checkUserEligibility()
    }
  }, [token, user, foodItem])

  const checkUserEligibility = async () => {
    if (!token || !user || !foodItem) return

    try {
      setIsCheckingUserEligibility(true)
      const response = await axios.get(`${contextUrl}/api/comment/check/${user._id}/${foodItem._id}`, {
        headers: { token },
      })

      console.log("Eligibility check response:", response.data)

      if (response.data.success) {
        setUserEligibility(response.data.data)
      } else {
        console.error("Eligibility check failed:", response.data.message)
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Error checking user eligibility:", error)
      toast.error("Lỗi khi kiểm tra quyền đánh giá")
    } finally {
      setIsCheckingUserEligibility(false)
    }
  }

  const fetchDebugInfo = async () => {
    if (!token || !user) return

    try {
      const response = await axios.get(`${contextUrl}/api/comment/debug/orders/${user._id}`, {
        headers: { token },
      })

      if (response.data.success) {
        setDebugInfo(response.data.data)
        setShowDebug(true)
      }
    } catch (error) {
      console.error("Error fetching debug info:", error)
    }
  }

  const handleFormSubmitted = () => {
    setShowForm(false)
    setRefreshTrigger((prev) => prev + 1)
    checkUserEligibility() // Refresh eligibility after submission
  }

  const handleWriteReviewComment = () => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để đánh giá và bình luận")
      return
    }
    setShowForm(true)
  }

  const canDoAnything = userEligibility?.canReview || userEligibility?.canComment

  return (
    <div>
      {showForm ? (
        <ReviewCommentForm
          foodId={foodItem._id}
          onSubmitted={handleFormSubmitted}
          onCancel={() => setShowForm(false)}
          userEligibility={userEligibility}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Đánh giá & Bình luận</h3>
              <p className="text-gray-400">Chia sẻ trải nghiệm và ý kiến của bạn về sản phẩm này</p>
            </div>

            {/* Action button */}
            {token && !isCheckingUserEligibility && (
              <motion.button
                onClick={handleWriteReviewComment}
                disabled={!canDoAnything}
                className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-2 ${
                  !canDoAnything
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 hover:shadow-primary/20"
                }`}
                whileHover={{ scale: canDoAnything ? 1.05 : 1 }}
                whileTap={{ scale: canDoAnything ? 0.95 : 1 }}
              >
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <MessageCircle className="w-4 h-4" />
                </div>
                {!canDoAnything
                  ? "Đã đánh giá & bình luận"
                  : userEligibility?.canReview && userEligibility?.canComment
                    ? "Đánh giá & Bình luận"
                    : userEligibility?.canReview
                      ? "Viết đánh giá"
                      : "Viết bình luận"}
              </motion.button>
            )}

            {/* Loading state for eligibility check */}
            {token && isCheckingUserEligibility && (
              <div className="animate-pulse bg-gray-600 h-12 w-48 rounded-xl"></div>
            )}
          </div>

          {/* Status indicators */}
          {token && userEligibility && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rating status */}
              <div
                className={`rounded-xl p-4 border ${
                  userEligibility.hasReviewed
                    ? "bg-green-900/20 border-green-500/30"
                    : userEligibility.canReview
                      ? "bg-yellow-900/20 border-yellow-500/30"
                      : "bg-red-900/20 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star
                    className={`w-5 h-5 ${
                      userEligibility.hasReviewed
                        ? "text-green-400"
                        : userEligibility.canReview
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  />
                  <div>
                    <h4
                      className={`font-semibold ${
                        userEligibility.hasReviewed
                          ? "text-green-400"
                          : userEligibility.canReview
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      Đánh giá sản phẩm
                    </h4>
                    <p
                      className={`text-sm ${
                        userEligibility.hasReviewed
                          ? "text-green-300"
                          : userEligibility.canReview
                            ? "text-yellow-300"
                            : "text-red-300"
                      }`}
                    >
                      {userEligibility.hasReviewed
                        ? "Đã đánh giá"
                        : userEligibility.canReview
                          ? "Có thể đánh giá"
                          : "Cần mua hàng để đánh giá"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comment status */}
              <div
                className={`rounded-xl p-4 border ${
                  userEligibility.hasCommented
                    ? "bg-green-900/20 border-green-500/30"
                    : "bg-blue-900/20 border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle
                    className={`w-5 h-5 ${userEligibility.hasCommented ? "text-green-400" : "text-blue-400"}`}
                  />
                  <div>
                    <h4
                      className={`font-semibold ${userEligibility.hasCommented ? "text-green-400" : "text-blue-400"}`}
                    >
                      Bình luận
                    </h4>
                    <p className={`text-sm ${userEligibility.hasCommented ? "text-green-300" : "text-blue-300"}`}>
                      {userEligibility.hasCommented ? "Đã bình luận" : "Có thể bình luận"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debug section */}
          {token && userEligibility && !userEligibility.hasPurchased && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <h4 className="text-red-400 font-semibold">Không thể đánh giá</h4>
                    <p className="text-red-300 text-sm">Bạn cần mua sản phẩm này trước khi có thể đánh giá</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={checkUserEligibility}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Kiểm tra lại
                  </button>
                  <button
                    onClick={fetchDebugInfo}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Debug
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Debug info modal */}
          {showDebug && debugInfo && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Debug: Thông tin đơn hàng</h3>
                  <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="text-white">
                    <strong>Tổng số đơn hàng:</strong> {debugInfo.totalOrders}
                  </div>
                  {debugInfo.orders.map((order, index) => (
                    <div key={index} className="bg-slate-700 rounded-lg p-4">
                      <div className="text-white mb-2">
                        <strong>Đơn hàng #{order.orderId}</strong>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>
                          <strong>Trạng thái:</strong> {order.status}
                        </div>
                        <div>
                          <strong>Thanh toán:</strong> {order.payment ? "Đã thanh toán" : "Chưa thanh toán"}
                        </div>
                        <div>
                          <strong>Trạng thái thanh toán:</strong> {order.paymentStatus || "N/A"}
                        </div>
                        <div>
                          <strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </div>
                        <div>
                          <strong>Sản phẩm:</strong>
                        </div>
                        <ul className="ml-4 space-y-1">
                          {order.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-xs">
                              - {item.name} (ID: {item.foodId || item._id || item.id || "N/A"})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ReviewsList
        foodId={foodItem._id}
        reviews={reviews}
        ratingStats={ratingStats}
        isLoadingReviews={isLoadingReviews}
        isLoadingStats={isLoadingStats}
        token={token}
        user={user}
        url={url}
        refreshTrigger={refreshTrigger}
        userEligibility={userEligibility}
      />
    </div>
  )
}

export default ReviewsTab
