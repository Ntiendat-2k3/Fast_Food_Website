"use client"

import { useState, useEffect, useContext } from "react"
import { StoreContext } from "../context/StoreContext"
import axios from "axios"
import { toast } from "react-toastify"

export const useReviews = (foodItem) => {
  console.log(foodItem);

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
    if (!foodItem?._id) {
      console.log("No foodItem._id, skipping fetchReviews")
      return
    }

    try {
      setIsLoadingReviews(true)
      console.log("=== FRONTEND: Fetching reviews ===")
      console.log("Fetching reviews for foodId:", foodItem._id)
      console.log("API URL:", `${url}/api/comment/food/${foodItem._id}`)
      console.log("Base URL:", url)

      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}`)
      console.log("Reviews response status:", response.status)
      console.log("Reviews response headers:", response.headers)
      console.log("Reviews response data:", JSON.stringify(response.data, null, 2))

      if (response.data && response.data.success) {
        const reviewsData = response.data.data || []
        setReviews(reviewsData)
        console.log("Reviews set successfully:", reviewsData.length, "reviews")
        if (reviewsData.length > 0) {
          console.log("Sample review:", JSON.stringify(reviewsData[0], null, 2))
        }
      } else {
        console.error("Failed to fetch reviews:", response.data?.message || "Unknown error")
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)
      console.error("Error config:", error.config)
      setReviews([])
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Fetch rating stats
  const fetchRatingStats = async () => {
    if (!foodItem?._id) {
      console.log("No foodItem._id, skipping fetchRatingStats")
      return
    }

    try {
      setIsLoadingStats(true)
      console.log("=== FRONTEND: Fetching rating stats ===")
      console.log("Fetching rating stats for foodId:", foodItem._id)
      console.log("API URL:", `${url}/api/comment/food/${foodItem._id}/stats`)

      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}/stats`)
      console.log("Rating stats response status:", response.status)
      console.log("Rating stats response data:", JSON.stringify(response.data, null, 2))

      if (response.data && response.data.success) {
        const statsData = response.data.data
        setRatingStats(statsData)
        console.log("Rating stats set successfully:", JSON.stringify(statsData, null, 2))
      } else {
        console.error("Failed to fetch rating stats:", response.data?.message || "Unknown error")
        setRatingStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
      }
    } catch (error) {
      console.error("Error fetching rating stats:", error)
      console.error("Error response:", error.response?.data)
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
      console.log("Missing requirements for checkReviewEligibility:", {
        foodId: !!foodItem?._id,
        token: !!token,
        userId: !!user?._id,
      })
      setReviewEligibility({
        canReview: false,
        hasReviewed: false,
        message: "Vui lòng đăng nhập để đánh giá",
      })
      return
    }

    try {
      setIsCheckingEligibility(true)
      console.log("=== FRONTEND: Checking review eligibility ===")
      console.log("Checking review eligibility for user:", user._id, "food:", foodItem._id)
      console.log("API URL:", `${url}/api/comment/check/${user._id}/${foodItem._id}`)
      console.log("Token:", token ? "Present" : "Missing")

      const response = await axios.get(`${url}/api/comment/check/${user._id}/${foodItem._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Review eligibility response status:", response.status)
      console.log("Review eligibility response data:", JSON.stringify(response.data, null, 2))

      if (response.data && response.data.success) {
        const eligibilityData = {
          canReview: response.data.data.canReview,
          hasReviewed: response.data.data.hasReviewed || false,
          hasPurchased: response.data.data.hasPurchased || false,
          message: response.data.message || "",
          existingRating: response.data.data.existingReview?.rating,
        }
        setReviewEligibility(eligibilityData)
        console.log("Review eligibility set successfully:", JSON.stringify(eligibilityData, null, 2))
      } else {
        console.error("Failed to check review eligibility:", response.data?.message || "Unknown error")
        setReviewEligibility({
          canReview: false,
          hasReviewed: false,
          message: response.data?.message || "Không thể kiểm tra quyền đánh giá",
        })
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error)
      console.error("Error response:", error.response?.data)
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
    console.log("=== FRONTEND: useEffect triggered ===")
    console.log("Food item:", foodItem?._id)
    console.log("Token:", !!token)
    console.log("User:", !!user?._id)

    if (foodItem?._id) {
      console.log("Food item changed, fetching data for:", foodItem._id)

      fetchReviews()
      fetchRatingStats()

      if (token && user?._id) {
        checkReviewEligibility()
      }
    }
  }, [foodItem?._id, token, user?._id])

  const handleReviewSubmitted = () => {
    console.log("Review submitted, refreshing data")
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

  console.log("=== FRONTEND: useReviews hook state ===")
  console.log("Reviews count:", reviews.length)
  console.log("Rating stats:", ratingStats)
  console.log("Review eligibility:", reviewEligibility)

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
