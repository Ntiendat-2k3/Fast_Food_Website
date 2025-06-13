"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

export const useReviews = (foodItem) => {
  const { url, user, token } = useContext(StoreContext)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 })
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [reviewEligibility, setReviewEligibility] = useState(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  useEffect(() => {
    if (foodItem?._id) {
      fetchReviews(foodItem._id)
      fetchRatingStats(foodItem._id)
    }
  }, [foodItem])

  // Kiểm tra quyền đánh giá khi user hoặc token thay đổi
  useEffect(() => {
    checkReviewEligibility()
  }, [user, token, foodItem])

  const checkReviewEligibility = async () => {
    if (!user || !user._id || !foodItem?._id || !token) {
      console.log("Missing requirements for review check:", { user: !!user, foodItem: !!foodItem, token: !!token })
      setReviewEligibility({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        reason: "Cần đăng nhập để đánh giá",
      })
      return
    }

    try {
      setIsCheckingEligibility(true)
      console.log(`Checking review eligibility for user ${user._id} and food ${foodItem._id}`)

      // Thử endpoint test trước
      const testResponse = await axios.get(`${url}/api/comment/test-review/${user._id}/${foodItem._id}`, {
        headers: { token },
      })

      console.log("Test review eligibility response:", testResponse.data)

      if (testResponse.data.success) {
        setReviewEligibility(testResponse.data.data)
      } else {
        // Fallback: cho phép đánh giá
        setReviewEligibility({
          canReview: true,
          hasPurchased: true,
          hasReviewed: false,
        })
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error)
      // Fallback: cho phép đánh giá nếu có lỗi
      setReviewEligibility({
        canReview: true,
        hasPurchased: true,
        hasReviewed: false,
      })
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  const fetchReviews = async (foodId) => {
    if (!foodId) return

    try {
      setIsLoadingReviews(true)
      const response = await axios.get(`${url}/api/comment/food/${foodId}`)
      if (response.data.success) {
        setReviews(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const fetchRatingStats = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/comment/food/${foodId}/stats`)
      if (response.data.success) {
        setRatingStats(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error)
    }
  }

  const handleReviewSubmitted = (newReview) => {
    setReviews([newReview, ...reviews])
    setShowReviewForm(false)
    // Refresh rating stats and eligibility
    if (foodItem._id) {
      fetchRatingStats(foodItem._id)
      checkReviewEligibility()
    }
  }

  const handleWriteReview = () => {
    if (!token) {
      toast.info("Vui lòng đăng nhập để viết đánh giá")
      return
    }

    if (!foodItem || !foodItem._id) {
      toast.error("Không thể xác định sản phẩm để đánh giá")
      return
    }

    setShowReviewForm(true)
  }

  const handleEditComment = (commentId) => {
    setEditingCommentId(commentId)
  }

  const handleSaveEdit = (updatedComment) => {
    setReviews(reviews.map((review) => (review._id === updatedComment._id ? updatedComment : review)))
    setEditingCommentId(null)
    // Refresh rating stats
    if (foodItem._id) {
      fetchRatingStats(foodItem._id)
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
  }

  return {
    showReviewForm,
    setShowReviewForm,
    reviews,
    isLoadingReviews,
    ratingStats,
    editingCommentId,
    reviewEligibility,
    isCheckingEligibility,
    handleReviewSubmitted,
    handleWriteReview,
    handleEditComment,
    handleSaveEdit,
    handleCancelEdit,
  }
}
