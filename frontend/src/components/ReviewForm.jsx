"use client"

import { useState, useContext, useEffect } from "react"
import { Star } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"
import { StoreContext } from "../context/StoreContext"
import ReviewEligibilityNotice from "./ReviewEligibilityNotice"

const ReviewForm = ({ foodId, onReviewSubmitted, onCancel }) => {
  const { url, token, user } = useContext(StoreContext)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewEligibility, setReviewEligibility] = useState(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true)

  // Kiểm tra quyền đánh giá khi component mount
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!user || !user._id || !foodId || !token) {
        console.log("Missing requirements for review check:", { user: !!user, foodId: !!foodId, token: !!token })
        setReviewEligibility({
          canReview: false,
          hasPurchased: false,
          hasReviewed: false,
          reason: "Cần đăng nhập để đánh giá",
        })
        setIsCheckingEligibility(false)
        return
      }

      try {
        console.log(`Checking review eligibility for user ${user._id} and food ${foodId}`)

        // Sử dụng endpoint chính thức để kiểm tra
        const response = await axios.get(`${url}/api/comment/can-review/${user._id}/${foodId}`, {
          headers: { token },
        })

        console.log("Review eligibility response:", response.data)

        if (response.data.success) {
          setReviewEligibility(response.data.data)
        } else {
          setReviewEligibility({
            canReview: false,
            hasPurchased: false,
            hasReviewed: false,
            reason: response.data.message || "Không thể kiểm tra quyền đánh giá",
          })
        }
      } catch (error) {
        console.error("Error checking review eligibility:", error)
        setReviewEligibility({
          canReview: false,
          hasPurchased: false,
          hasReviewed: false,
          reason: "Lỗi khi kiểm tra quyền đánh giá",
        })
      } finally {
        setIsCheckingEligibility(false)
      }
    }

    checkReviewEligibility()
  }, [user, foodId, token, url])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate inputs
    if (!user || !user._id) {
      toast.error("Vui lòng đăng nhập để đánh giá")
      return
    }

    if (!foodId) {
      toast.error("Không thể xác định sản phẩm để đánh giá")
      return
    }

    if (comment.trim().length < 5) {
      toast.error("Vui lòng nhập nội dung đánh giá (ít nhất 5 ký tự)")
      return
    }

    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5")
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting review with data:", {
        userId: user._id,
        foodId,
        rating,
        comment: comment.trim(),
      })

      const response = await axios.post(
        `${url}/api/comment/add`,
        {
          userId: user._id,
          foodId,
          rating: Number(rating),
          comment: comment.trim(),
        },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Review submission response:", response.data)

      if (response.data.success) {
        toast.success("Đánh giá của bạn đã được gửi thành công!")
        setComment("")
        setRating(5)

        if (onReviewSubmitted && response.data.data) {
          onReviewSubmitted(response.data.data)
        }

        if (onCancel) {
          onCancel()
        }
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi gửi đánh giá")
      }
    } catch (error) {
      console.error("Error submitting review:", error)

      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại")
      } else {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isCheckingEligibility) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-slate-700">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Đang kiểm tra quyền đánh giá...</span>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <ReviewEligibilityNotice type="not-logged-in" />
  }

  // Already reviewed
  if (reviewEligibility?.hasReviewed) {
    return <ReviewEligibilityNotice type="already-reviewed" />
  }

  // Haven't purchased
  if (reviewEligibility && !reviewEligibility.hasPurchased) {
    return <ReviewEligibilityNotice type="not-purchased" />
  }

  // Can review - show form
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-slate-700">
      <h3 className="text-lg font-medium text-white mb-4">Viết đánh giá của bạn</h3>

      <div className="mb-6 p-4 bg-emerald-900/30 rounded-lg border border-emerald-700">
        <p className="text-sm text-emerald-400 flex items-center">
          <span className="bg-emerald-800/50 p-1 rounded-full mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          Bạn đã mua sản phẩm này và có thể viết đánh giá
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-gray-300 mb-2">Đánh giá của bạn</label>
          <div className="flex items-center bg-slate-700/50 p-3 rounded-lg border border-slate-600">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`${
                    (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-3 text-gray-300 bg-slate-800/50 px-3 py-1 rounded-full text-sm">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Rất tốt"}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="comment" className="block text-gray-300 mb-2">
            Nội dung đánh giá
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-slate-700/50 text-white placeholder-gray-400"
            required
            minLength={5}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-400">Tối thiểu 5 ký tự</p>
            <p className="text-xs text-gray-400">{comment.length} ký tự</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700 transition-colors"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || comment.trim().length < 5}
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-slate-900 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang gửi...
              </span>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
