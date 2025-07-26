"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

export const useReviews = (foodItem) => {
  const { url, token, user } = useContext(StoreContext)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState([])
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [reviewEligibility, setReviewEligibility] = useState({
    canReview: false,
    hasReviewed: false,
    message: "",
  })
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  // Fetch reviews for the food item
  const fetchReviews = async () => {
    if (!foodItem?._id) return

    try {
      setIsLoadingReviews(true)
      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}`)

      if (response.data.success) {
        setReviews(response.data.data || [])
      } else {
        console.error("Failed to fetch reviews:", response.data.message)
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviews([])
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Fetch rating stats
  const fetchRatingStats = async () => {
    if (!foodItem?._id) return

    try {
      setIsLoadingStats(true)
      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}/stats`)

      if (response.data.success) {
        setRatingStats(response.data.data)
      } else {
        console.error("Failed to fetch rating stats:", response.data.message)
        setRatingStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error)
      setRatingStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Check if user can review this product
  const checkReviewEligibility = async () => {
    if (!foodItem?._id || !token || !user?._id) {
      setReviewEligibility({
        canReview: false,
        hasReviewed: false,
        message: "Vui lòng đăng nhập để đánh giá",
      })
      return
    }

    try {
      setIsCheckingEligibility(true)
      const response = await axios.get(`${url}/api/comment/check/${user._id}/${foodItem._id}`)

      if (response.data.success) {
        setReviewEligibility({
          canReview: response.data.data.canReview,
          hasReviewed: response.data.data.hasReviewed || false,
          message: response.data.message || "",
          existingRating: response.data.data.existingReview?.rating,
        })
      } else {
        setReviewEligibility({
          canReview: false,
          hasReviewed: false,
          message: response.data.message || "Không thể kiểm tra quyền đánh giá",
        })
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error)
      setReviewEligibility({
        canReview: false,
        hasReviewed: false,
        message: "Có lỗi xảy ra khi kiểm tra quyền đánh giá",
      })
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  // Load reviews and check eligibility when food item changes
  useEffect(() => {
    if (foodItem?._id) {
      fetchReviews()
      fetchRatingStats()
      checkReviewEligibility()
    }
  }, [foodItem?._id, token, user?._id])

  const handleReviewSubmitted = () => {
    fetchReviews()
    fetchRatingStats()
    checkReviewEligibility()
    setShowReviewForm(false)
    toast.success("Đánh giá của bạn đã được gửi!")
  }

  const handleWriteReview = () => {
    if (!token) {
      toast.info("Vui lòng đăng nhập để viết đánh giá")
      return
    }
    setShowReviewForm(true)
  }

  return {
    showReviewForm,
    setShowReviewForm,
    reviews,
    ratingStats,
    isLoadingReviews,
    isLoadingStats,
    reviewEligibility,
    isCheckingEligibility,
    handleReviewSubmitted,
    handleWriteReview,
  }
}
