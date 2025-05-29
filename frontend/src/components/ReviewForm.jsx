"use client"

import { useState, useContext, useEffect } from "react"
import { Star } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"
import { StoreContext } from "../context/StoreContext"

const ReviewForm = ({ foodId, onReviewSubmitted, onCancel }) => {
  const { url, token } = useContext(StoreContext)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userData, setUserData] = useState(null)

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get token from localStorage or context
        const authToken = token || localStorage.getItem("token")

        if (!authToken) {
          console.log("No token found")
          return
        }

        // Try to get user from localStorage first
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("Using user data from localStorage:", parsedUser)
          setUserData(parsedUser)
          return
        }

        // If no stored user, fetch from API
        console.log("Fetching user data from API")
        const response = await axios.get(`${url}/api/user/profile`, {
          headers: { token: authToken },
        })

        if (response.data.success && response.data.user) {
          console.log("Retrieved user data from API:", response.data.user)
          setUserData(response.data.user)
          localStorage.setItem("user", JSON.stringify(response.data.user))
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    loadUserData()
  }, [token, url])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate inputs
    if (!userData || !userData._id) {
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

      const authToken = token || localStorage.getItem("token")

      if (!authToken) {
        toast.error("Vui lòng đăng nhập để đánh giá")
        return
      }

      console.log("Submitting review with:", {
        userId: userData._id,
        foodId,
        rating,
        comment: comment.trim(),
      })

      const response = await axios.post(
        `${url}/api/comment/add`,
        {
          userId: userData._id,
          foodId,
          rating: Number(rating),
          comment: comment.trim(),
        },
        {
          headers: {
            token: authToken,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Review submission response:", response.data)

      if (response.data.success) {
        toast.success("Đánh giá của bạn đã được gửi thành công!")

        // Reset form
        setComment("")
        setRating(5)

        // Call callback if provided
        if (onReviewSubmitted && response.data.data) {
          onReviewSubmitted(response.data.data)
        }

        // Call cancel to close form
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
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } else {
        toast.error("Có lỗi xảy ra khi gửi đánh giá: " + (error.response?.data?.message || error.message))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-dark dark:text-white mb-4">Viết đánh giá của bạn</h3>

      {userData ? (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-light rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Đánh giá với tên: <span className="font-medium text-dark dark:text-white">{userData.name}</span>
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Vui lòng đăng nhập để có thể đánh giá sản phẩm</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Đánh giá của bạn</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  size={24}
                  className={`${
                    (hoverRating || rating) >= star
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Rất tốt"}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 dark:text-gray-300 mb-2">
            Nội dung đánh giá
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-gray-700 dark:text-gray-300"
            required
            minLength={5}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tối thiểu 5 ký tự ({comment.length}/5)</p>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-light transition-colors"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !userData || comment.trim().length < 5}
            className="px-4 py-2 bg-primary hover:bg-primary-light text-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
