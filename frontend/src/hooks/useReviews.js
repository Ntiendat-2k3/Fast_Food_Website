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
  const [reviewEligibility, setReviewEligibility] = useState(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  // Fetch reviews
  const fetchReviews = async () => {
    if (!foodItem?._id) return

    try {
      setIsLoadingReviews(true)
      console.log("Fetching reviews for foodId:", foodItem._id)

      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}`)
      console.log("Reviews response:", response.data)

      if (response.data && response.data.success) {
        setReviews(response.data.data || [])
      } else {
        console.error("Failed to fetch reviews:", response.data?.message)
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
      console.log("Fetching rating stats for foodId:", foodItem._id)

      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}/stats`)
      console.log("Rating stats response:", response.data)

      if (response.data && response.data.success) {
        setRatingStats(response.data.data)
      } else {
        console.error("Failed to fetch rating stats:", response.data?.message)
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

  // Check review eligibility
  const checkReviewEligibility = async () => {
    if (!token || !user || !foodItem?._id) {
      setReviewEligibility({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        existingReview: null,
      })
      setIsCheckingEligibility(false)
      return
    }

    try {
      setIsCheckingEligibility(true)
      console.log("Checking review eligibility for foodId:", foodItem._id)

      const response = await axios.get(`${url}/api/comment/check/${user._id}/${foodItem._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Review eligibility response:", response.data)

      if (response.data && response.data.success) {
        setReviewEligibility(response.data.data)
      } else {
        console.error("Failed to check review eligibility:", response.data?.message)
        setReviewEligibility({
          canReview: false,
          hasPurchased: false,
          hasReviewed: false,
          existingReview: null,
        })
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error)
      setReviewEligibility({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        existingReview: null,
      })
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  // Handle review submitted
  const handleReviewSubmitted = async () => {
    console.log("Review submitted, refreshing data")
    await Promise.all([fetchReviews(), fetchRatingStats(), checkReviewEligibility()])
    setShowReviewForm(false)
    toast.success("Đánh giá của bạn đã được gửi thành công!")
  }

  // Handle write review button click
  const handleWriteReview = () => {
    if (!token || !user) {
      toast.error("Vui lòng đăng nhập để đánh giá")
      return
    }

    if (!reviewEligibility?.canReview) {
      toast.error("Bạn cần mua sản phẩm này trước khi có thể đánh giá")
      return
    }

    setShowReviewForm(true)
  }

  // Initial data fetch
  useEffect(() => {
    if (foodItem?._id) {
      console.log("Food item changed, fetching data for:", foodItem._id)
      Promise.all([fetchReviews(), fetchRatingStats(), checkReviewEligibility()])
    }
  }, [foodItem?._id, token, user])

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
