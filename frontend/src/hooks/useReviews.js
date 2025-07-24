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
  const [editingRatingId, setEditingRatingId] = useState(null)
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
        canRate: false,
        hasPurchased: false,
        hasRated: false,
        reason: "Cần đăng nhập để đánh giá",
      })
      return
    }

    try {
      setIsCheckingEligibility(true)
      console.log(`Checking review eligibility for user ${user._id} and food ${foodItem._id}`)

      // Sử dụng endpoint chính thức
      const response = await axios.get(`${url}/api/comment/can-rate/${user._id}/${foodItem._id}`, {
        headers: { token },
      })

      console.log("Review eligibility response:", response.data)

      if (response.data.success) {
        setReviewEligibility(response.data.data)

        // Log thông tin debug
        if (response.data.data.debug) {
          console.log("Debug info:", response.data.data.debug)
        }
      } else {
        setReviewEligibility({
          canRate: false,
          hasPurchased: false,
          hasRated: false,
          reason: response.data.message || "Không thể kiểm tra quyền đánh giá",
        })
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error)
      // Trong trường hợp lỗi, vẫn cho phép thử đánh giá
      setReviewEligibility({
        canRate: true,
        hasPurchased: true,
        hasRated: false,
        reason: "Không thể kiểm tra, cho phép thử đánh giá",
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
      toast.info("Vui lòng đăng nhập để đánh giá")
      return
    }

    if (!foodItem || !foodItem._id) {
      toast.error("Không thể xác định sản phẩm để đánh giá")
      return
    }

    setShowReviewForm(true)
  }

  const handleEditRating = (ratingId) => {
    setEditingRatingId(ratingId)
  }

  const handleSaveEdit = (updatedRating) => {
    setReviews(reviews.map((review) => (review._id === updatedRating._id ? updatedRating : review)))
    setEditingRatingId(null)
    // Refresh rating stats
    if (foodItem._id) {
      fetchRatingStats(foodItem._id)
    }
  }

  const handleCancelEdit = () => {
    setEditingRatingId(null)
  }

  return {
    showReviewForm,
    setShowReviewForm,
    reviews,
    isLoadingReviews,
    ratingStats,
    editingRatingId,
    reviewEligibility,
    isCheckingEligibility,
    handleReviewSubmitted,
    handleWriteReview,
    handleEditRating,
    handleSaveEdit,
    handleCancelEdit,
  }
}
