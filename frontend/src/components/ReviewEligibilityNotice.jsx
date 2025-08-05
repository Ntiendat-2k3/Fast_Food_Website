"use client"

import { useContext } from "react"
import { Star, ShoppingCart, User, CheckCircle } from "lucide-react"
import { StoreContext } from "../context/StoreContext"

const ReviewEligibilityNotice = ({ eligibility, onWriteReview }) => {
  const { token, user } = useContext(StoreContext)

  // Nếu chưa đăng nhập
  if (!token || !user) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-300">Đăng nhập để đánh giá</h4>
            <p className="text-sm text-gray-300 mt-1">Vui lòng đăng nhập để có thể viết đánh giá cho sản phẩm này.</p>
          </div>
        </div>
      </div>
    )
  }

  // Nếu đã có đánh giá
  if (eligibility?.hasReviewed === true) {
    return (
      <div className="bg-gray-800 border border-yellow-500 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-300">Bạn đã đánh giá sản phẩm này</h4>
            <p className="text-sm text-gray-300 mt-1">
              Cảm ơn bạn đã chia sẻ đánh giá. Bạn có thể xem đánh giá của mình trong danh sách bên dưới.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Nếu có thể đánh giá
  if (eligibility?.canReview === true) {
    return (
      <div className="bg-gray-800 border border-yellow-500 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <div>
              <h4 className="font-medium text-yellow-300">Chia sẻ trải nghiệm của bạn</h4>
              <p className="text-sm text-gray-300 mt-1">
                Bạn đã mua sản phẩm này. Hãy để lại đánh giá để giúp khách hàng khác!
              </p>
            </div>
          </div>
          <button
            onClick={onWriteReview}
            className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
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
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-gray-300">Mua hàng để đánh giá</h4>
          <p className="text-sm text-gray-400 mt-1">
            Bạn cần mua và nhận được sản phẩm này trước khi có thể viết đánh giá.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReviewEligibilityNotice
