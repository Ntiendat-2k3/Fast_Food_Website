import { useState, useEffect, useContext } from 'react'
import { StoreContext } from '../context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

export const useReviews = (foodItem) => {
  const { url, token, user } = useContext(StoreContext)
  const [reviews, setReviews] = useState([])
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  })
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [reviewEligibility, setReviewEligibility] = useState(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}`)
      if (response.data.success) {
        setReviews(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Fetch rating stats
  const fetchRatingStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await axios.get(`${url}/api/comment/food/${foodItem._id}/stats`)
      if (response.data.success) {
        setRatingStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error)
      setRatingStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {}
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Check review eligibility
  const checkReviewEligibility = async () => {
    if (!token || !user) {
      setReviewEligibility({ canReview: false, reason: 'not_logged_in' })
      return
    }

    try {
      setIsCheckingEligibility(true)
      const response = await axios.get(
        `${url}/api/comment/eligibility/${foodItem._id}`,
        { headers: { token } }
      )

      if (response.data.success) {
        setReviewEligibility(response.data.data)
      } else {
        setReviewEligibility({ canReview: false, reason: 'error' })
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error)
      setReviewEligibility({ canReview: false, reason: 'error' })
    } finally {
      setIsCheckingEligibility(false)
    }
  }

  // Handle review submitted
  const handleReviewSubmitted = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews])
    setShowReviewForm(false)

    // Update rating stats
    fetchRatingStats()

    // Update eligibility
    checkReviewEligibility()

    toast.success('Đánh giá của bạn đã được gửi thành công!')
  }

  // Handle write review
  const handleWriteReview = () => {
    if (!reviewEligibility?.canReview) {
      if (reviewEligibility?.reason === 'not_logged_in') {
        toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
      } else if (reviewEligibility?.reason === 'not_purchased') {
        toast.error('Bạn cần mua sản phẩm này trước khi đánh giá')
      } else if (reviewEligibility?.reason === 'already_reviewed') {
        toast.error('Bạn đã đánh giá sản phẩm này rồi')
      }
      return
    }
    setShowReviewForm(true)
  }

  // Update review in list
  const updateReviewInList = (updatedReview) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review._id === updatedReview._id ? updatedReview : review
      )
    )
  }

  // Remove review from list
  const removeReviewFromList = (reviewId) => {
    setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId))
  }

  useEffect(() => {
    if (foodItem?._id) {
      fetchReviews()
      fetchRatingStats()
      checkReviewEligibility()
    }
  }, [foodItem?._id, token, user])

  return {
    reviews,
    setReviews,
    ratingStats,
    isLoadingReviews,
    isLoadingStats,
    reviewEligibility,
    isCheckingEligibility,
    showReviewForm,
    setShowReviewForm,
    handleReviewSubmitted,
    handleWriteReview,
    updateReviewInList,
    removeReviewFromList,
    fetchReviews,
    fetchRatingStats
  }
}
