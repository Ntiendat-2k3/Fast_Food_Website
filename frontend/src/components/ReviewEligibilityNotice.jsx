"use client"

import { useContext } from "react"
import { Star, ShoppingCart, User, CheckCircle } from "lucide-react"
import { StoreContext } from "../context/StoreContext"

const ReviewEligibilityNotice = ({ eligibility, onWriteReview }) => {
  const { token, user } = useContext(StoreContext)

  // Nếu chưa đăng nhập
  if (!token || !user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Đăng nhập để đánh giá</h4>
            <p className="text-sm text-blue-700 mt-1">Vui lòng đăng nhập để có thể viết đánh giá cho sản phẩm này.</p>
          </div>
        </div>
      </div>
    )
  }

  // Nếu đã có đánh giá
  if (eligibility?.hasReviewed && eligibility?.existingReview) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-green-900">Bạn đã đánh giá sản phẩm này</h4>
            <div className="mt-2 bg-white rounded-md p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < eligibility.existingReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{eligibility.existingReview.rating} sao</span>
              </div>
              <p className="text-sm text-gray-700">"{eligibility.existingReview.comment}"</p>
              <p className="text-xs text-gray-500 mt-2">
                Đánh giá vào {new Date(eligibility.existingReview.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Nếu có thể đánh giá
  if (eligibility?.canReview) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-900">Chia sẻ trải nghiệm của bạn</h4>
              <p className="text-sm text-orange-700 mt-1">
                Bạn đã mua sản phẩm này. Hãy để lại đánh giá để giúp khách hàng khác!
              </p>
            </div>
          </div>
          <button
            onClick={onWriteReview}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Star className="w-4 h-4" />
            Viết đánh giá
          </button>
        </div>
      </div>
    )
  }

  // Nếu chưa mua hàng
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-5 h-5 text-gray-600 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-gray-900">Mua hàng để đánh giá</h4>
          <p className="text-sm text-gray-600 mt-1">
            Bạn cần mua và nhận được sản phẩm này trước khi có thể viết đánh giá.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReviewEligibilityNotice
